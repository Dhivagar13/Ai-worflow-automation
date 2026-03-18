"""
LangGraph Workflow Definition — Orchestrates all 4 agents with conditional edges.

This module defines the complete LangGraph workflow:
  User Input → Planner → Tool Selector → Executor → Monitor
                                                       ↓
                                              approved → END (final output)
                                              rejected → loop back to Executor (max 2 retries)

The Monitor's decision drives the conditional edge routing.
"""

from langgraph.graph import StateGraph, END

from backend.state import AgentState
from backend.agents.planner import planner_agent
from backend.agents.tool_selector import tool_selector_agent
from backend.agents.executor import executor_agent
from backend.agents.monitor import monitor_agent


# ─────────────────────────────────────────────────────────────────────────────
# Conditional Edge: Route based on Monitor decision
# ─────────────────────────────────────────────────────────────────────────────

def should_retry_or_finish(state: dict) -> str:
    """
    Conditional edge function for LangGraph.

    After the Monitor agent runs, this function decides the next step:
    - If approved → route to END (output the final result)
    - If rejected and retries remaining → route back to Executor for re-execution
    - If rejected but max retries exceeded → route to END (forced approval)
    """
    decision = state.get("monitor_decision", "approved")
    retry_count = state.get("retry_count", 0)

    if decision == "approved":
        return "end"
    elif retry_count <= 2:
        # Retry: go back to executor with feedback
        return "retry"
    else:
        # Max retries exceeded — shouldn't happen (monitor forces approval) but safety net
        return "end"


# ─────────────────────────────────────────────────────────────────────────────
# Build the LangGraph Workflow
# ─────────────────────────────────────────────────────────────────────────────

def build_workflow() -> StateGraph:
    """
    Construct and compile the LangGraph workflow with all 4 agents
    and conditional edges for the retry loop.

    Returns:
        Compiled LangGraph StateGraph ready for invocation.
    """
    # Create the graph with our shared state schema
    workflow = StateGraph(AgentState)

    # ── Add all agent nodes ───────────────────────────────────────────────
    workflow.add_node("planner", planner_agent)
    workflow.add_node("tool_selector", tool_selector_agent)
    workflow.add_node("executor", executor_agent)
    workflow.add_node("monitor", monitor_agent)

    # ── Define edges (linear flow + conditional loop) ────────────────────
    # Entry point: Planner is the first agent
    workflow.set_entry_point("planner")

    # Planner → Tool Selector
    workflow.add_edge("planner", "tool_selector")

    # Tool Selector → Executor
    workflow.add_edge("tool_selector", "executor")

    # Executor → Monitor
    workflow.add_edge("executor", "monitor")

    # Monitor → conditional: either END or loop back to Executor
    workflow.add_conditional_edges(
        "monitor",
        should_retry_or_finish,
        {
            "end": END,           # Approved → finish
            "retry": "executor",  # Rejected → re-execute with feedback
        },
    )

    # ── Compile the graph ─────────────────────────────────────────────────
    compiled = workflow.compile()
    return compiled
