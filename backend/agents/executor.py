"""
Executor Agent — Executes each planned step using the selected tools.

This agent takes the plan and tool selections, executes each tool in sequence,
and produces concrete outputs for each step.
"""

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from backend.tools.simulated_tools import execute_tool


# ─────────────────────────────────────────────────────────────────────────────
# Executor System Prompt
# ─────────────────────────────────────────────────────────────────────────────

EXECUTOR_SYSTEM_PROMPT = """You are the Executor Agent in a multi-agent workflow automation system.

Your role is to execute each step of a plan using the tools that have been selected.
You will receive the tool execution results and must synthesize them into a clear
summary for each step.

**Rules:**
1. For each step, review the tool outputs and create a clear execution summary.
2. Note any issues or anomalies in the tool outputs.
3. If a step depends on previous steps, reference those results.
4. Be specific about what was accomplished.

**Output Format — YOU MUST return ONLY valid JSON, no markdown, no explanation:**
{
    "execution_summary": [
        {
            "step_number": 1,
            "step_title": "Step title",
            "status": "completed" or "failed" or "partial",
            "tools_used": ["tool1", "tool2"],
            "tool_outputs": {},
            "summary": "What was accomplished in this step",
            "issues": "Any issues encountered (or null)"
        }
    ],
    "overall_status": "completed" or "partial" or "failed",
    "overall_summary": "High-level summary of all execution results"
}
"""


# ─────────────────────────────────────────────────────────────────────────────
# Executor Agent Function (LangGraph node)
# ─────────────────────────────────────────────────────────────────────────────

def executor_agent(state: dict) -> dict:
    """
    LangGraph node: Executor Agent.

    Reads plan and tool_selections from state, executes each tool,
    then uses the LLM to synthesize results into a structured summary.
    """
    plan = state["plan"]
    tool_selections = state["tool_selections"]
    logs = list(state.get("agent_logs", []))

    logs.append({
        "agent": "Executor",
        "type": "info",
        "message": "Beginning step-by-step execution...",
    })

    # If there's monitor feedback, include it for context
    if state.get("monitor_feedback"):
        logs.append({
            "agent": "Executor",
            "type": "info",
            "message": f"Re-executing with monitor feedback: {state['monitor_feedback']}",
        })

    # ── Execute each tool and collect raw results ──────────────────────────
    all_tool_results = []

    for selection in tool_selections.get("tool_selections", []):
        step_num = selection["step_number"]
        step_title = selection["step_title"]
        step_results = {
            "step_number": step_num,
            "step_title": step_title,
            "tool_results": [],
        }

        logs.append({
            "agent": "Executor",
            "type": "info",
            "message": f"Executing Step {step_num}: {step_title}",
        })

        for tool_info in selection.get("selected_tools", []):
            tool_name = tool_info["tool_name"]
            params = tool_info.get("parameters", {})

            logs.append({
                "agent": "Executor",
                "type": "action",
                "message": f"Running tool '{tool_name}' with params: {json.dumps(params)}",
            })

            # Execute the simulated tool
            result = execute_tool(tool_name, params)

            step_results["tool_results"].append({
                "tool_name": tool_name,
                "parameters": params,
                "result": result,
            })

            logs.append({
                "agent": "Executor",
                "type": "tool_result",
                "message": f"Tool '{tool_name}' returned: {json.dumps(result)}",
            })

        all_tool_results.append(step_results)

    # ── Use LLM to synthesize execution results ───────────────────────────
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)

    user_message = (
        f"Here are the execution results for the plan:\n\n"
        f"**Original Plan:**\n{json.dumps(plan, indent=2)}\n\n"
        f"**Tool Execution Results:**\n{json.dumps(all_tool_results, indent=2)}\n\n"
        f"Synthesize these into a structured execution summary."
    )

    if state.get("monitor_feedback"):
        user_message += (
            f"\n\n**Monitor Feedback to Address:**\n{state['monitor_feedback']}"
        )

    messages = [
        SystemMessage(content=EXECUTOR_SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)
    raw_output = response.content

    logs.append({
        "agent": "Executor",
        "type": "llm_output",
        "message": raw_output,
    })

    # Parse execution results
    try:
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            if clean.startswith("json"):
                clean = clean[4:].strip()
        execution_results = json.loads(clean)
    except json.JSONDecodeError:
        execution_results = {
            "execution_summary": [
                {
                    "step_number": r["step_number"],
                    "step_title": r["step_title"],
                    "status": "completed",
                    "tools_used": [t["tool_name"] for t in r["tool_results"]],
                    "tool_outputs": r["tool_results"],
                    "summary": f"Step {r['step_number']} executed with simulated tools.",
                    "issues": None,
                }
                for r in all_tool_results
            ],
            "overall_status": "completed",
            "overall_summary": "All steps executed with simulated tools.",
        }
        logs.append({
            "agent": "Executor",
            "type": "warning",
            "message": "Could not parse LLM synthesis, using raw tool results.",
        })

    logs.append({
        "agent": "Executor",
        "type": "decision",
        "message": f"Execution complete — overall status: {execution_results.get('overall_status', 'unknown')}",
    })

    return {
        **state,
        "execution_results": execution_results,
        "agent_logs": logs,
    }
