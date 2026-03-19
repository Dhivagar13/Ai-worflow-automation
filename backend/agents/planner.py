"""
Planner Agent — Decomposes user input into a structured, step-by-step task plan.

This agent receives a natural language task description and produces a clear list
of sequential steps with dependencies noted. It's the first agent in the workflow.
"""

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage


# ─────────────────────────────────────────────────────────────────────────────
# Planner System Prompt
# ─────────────────────────────────────────────────────────────────────────────

PLANNER_SYSTEM_PROMPT = """You are the Planner Agent in a multi-agent workflow automation system.

Your role is to decompose a user's natural language task into a structured, step-by-step execution plan.

**Rules:**
1. Break the task into 3-7 concrete, actionable steps.
2. Each step must be specific and executable.
3. Note dependencies between steps (which steps must complete before others can start).
4. Consider edge cases and validation steps.
5. Keep steps practical and realistic.

**Output Format — YOU MUST return ONLY valid JSON, no markdown, no explanation:**
{
    "task_summary": "Brief one-line summary of the overall task",
    "steps": [
        {
            "step_number": 1,
            "title": "Short step title",
            "description": "Detailed description of what this step does",
            "depends_on": [],
            "expected_output": "What this step should produce"
        }
    ],
    "reasoning": "Brief explanation of why you structured the plan this way"
}
"""


# ─────────────────────────────────────────────────────────────────────────────
# Planner Agent Function (LangGraph node)
# ─────────────────────────────────────────────────────────────────────────────

def planner_agent(state: dict) -> dict:
    """
    LangGraph node: Planner Agent.

    Reads user_input from state, calls the LLM to generate a structured plan,
    and writes the plan + logs back into state.
    """
    user_input = state["user_input"]
    logs = list(state.get("agent_logs", []))

    logs.append({
        "agent": "Planner",
        "type": "info",
        "message": f"Received task: {user_input}",
    })
    logs.append({
        "agent": "Planner",
        "type": "reasoning",
        "message": "Analyzing task to create a structured execution plan...",
    })

    # Build prompt with retry context if available
    user_message = f"Create a detailed execution plan for the following task:\n\n{user_input}"

    # If there's monitor feedback from a previous cycle, include it
    if state.get("monitor_feedback"):
        user_message += (
            f"\n\n**IMPORTANT — Previous Review Feedback:**\n{state['monitor_feedback']}\n"
            "Please revise the plan to address the above feedback."
        )
        logs.append({
            "agent": "Planner",
            "type": "info",
            "message": f"Incorporating monitor feedback: {state['monitor_feedback']}",
        })

    # Call the LLM
    llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.3)
    messages = [
        SystemMessage(content=PLANNER_SYSTEM_PROMPT),
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)
    raw_output = response.content

    logs.append({
        "agent": "Planner",
        "type": "llm_output",
        "message": raw_output,
    })

    # Parse the LLM output as JSON
    try:
        # Strip markdown code fences if present
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            if clean.startswith("json"):
                clean = clean[4:].strip()
        plan = json.loads(clean)
    except json.JSONDecodeError:
        # Fallback: try to extract JSON from the response
        plan = {
            "task_summary": f"Plan for: {user_input}",
            "steps": [
                {
                    "step_number": 1,
                    "title": "Execute task",
                    "description": user_input,
                    "depends_on": [],
                    "expected_output": "Task completed",
                }
            ],
            "reasoning": "Fallback plan due to parsing error.",
        }
        logs.append({
            "agent": "Planner",
            "type": "warning",
            "message": "Could not parse LLM output as JSON, using fallback plan.",
        })

    logs.append({
        "agent": "Planner",
        "type": "decision",
        "message": f"Plan created with {len(plan.get('steps', []))} steps: {plan.get('task_summary', '')}",
    })

    return {
        **state,
        "plan": plan,
        "agent_logs": logs,
    }
