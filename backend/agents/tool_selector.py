"""
Tool Selector Agent — Determines which tools are needed for each plan step.

This agent examines the structured plan and maps each step to one or more
simulated tools from the available tool registry.
"""

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from backend.tools.simulated_tools import AVAILABLE_TOOLS


# ─────────────────────────────────────────────────────────────────────────────
# Tool Selector System Prompt
# ─────────────────────────────────────────────────────────────────────────────

TOOL_SELECTOR_SYSTEM_PROMPT = """You are the Tool Selector Agent in a multi-agent workflow automation system.

Your role is to analyze each step in an execution plan and determine which tools are required.

**Available Tools:**
{tools_description}

**Rules:**
1. For each plan step, select 1-3 appropriate tools.
2. Specify realistic parameters for each tool based on the step description.
3. If no exact tool matches, pick the closest available tool.
4. Consider the dependencies between steps when selecting tools.

**Output Format — YOU MUST return ONLY valid JSON, no markdown, no explanation:**
{{
    "tool_selections": [
        {{
            "step_number": 1,
            "step_title": "Step title from plan",
            "selected_tools": [
                {{
                    "tool_name": "tool_name_from_registry",
                    "reason": "Why this tool was selected for this step",
                    "parameters": {{
                        "param1": "value1",
                        "param2": "value2"
                    }}
                }}
            ]
        }}
    ],
    "reasoning": "Overall reasoning for tool selection strategy"
}}
"""


# ─────────────────────────────────────────────────────────────────────────────
# Tool Selector Agent Function (LangGraph node)
# ─────────────────────────────────────────────────────────────────────────────

def tool_selector_agent(state: dict) -> dict:
    """
    LangGraph node: Tool Selector Agent.

    Reads the plan from state, determines which simulated tools each step needs,
    and writes tool_selections + logs back into state.
    """
    plan = state["plan"]
    logs = list(state.get("agent_logs", []))

    logs.append({
        "agent": "Tool Selector",
        "type": "info",
        "message": f"Analyzing plan with {len(plan.get('steps', []))} steps for tool selection...",
    })

    # Build a description of available tools for the prompt
    tools_desc = "\n".join(
        f"- **{t['name']}**: {t['description']} (params: {', '.join(t['parameters'])})"
        for t in AVAILABLE_TOOLS.values()
    )

    # Format the prompt
    system_prompt = TOOL_SELECTOR_SYSTEM_PROMPT.format(tools_description=tools_desc)

    user_message = (
        f"Here is the execution plan to analyze:\n\n"
        f"{json.dumps(plan, indent=2)}\n\n"
        f"Select the most appropriate tools for each step."
    )

    # Call the LLM
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.2)
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)
    raw_output = response.content

    logs.append({
        "agent": "Tool Selector",
        "type": "llm_output",
        "message": raw_output,
    })

    # Parse the LLM output
    try:
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            if clean.startswith("json"):
                clean = clean[4:].strip()
        selections = json.loads(clean)
    except json.JSONDecodeError:
        # Fallback: assign a generic tool to each step
        selections = {
            "tool_selections": [
                {
                    "step_number": step["step_number"],
                    "step_title": step["title"],
                    "selected_tools": [
                        {
                            "tool_name": "process_data",
                            "reason": "Default fallback tool",
                            "parameters": {"data_source": "input", "operation": "process"},
                        }
                    ],
                }
                for step in plan.get("steps", [])
            ],
            "reasoning": "Fallback selection due to parsing error.",
        }
        logs.append({
            "agent": "Tool Selector",
            "type": "warning",
            "message": "Could not parse LLM output, using fallback tool selections.",
        })

    # Log each tool selection decision
    for sel in selections.get("tool_selections", []):
        tool_names = [t["tool_name"] for t in sel.get("selected_tools", [])]
        logs.append({
            "agent": "Tool Selector",
            "type": "decision",
            "message": f"Step {sel['step_number']} ('{sel['step_title']}'): selected tools → {tool_names}",
        })

    return {
        **state,
        "tool_selections": selections,
        "agent_logs": logs,
    }
