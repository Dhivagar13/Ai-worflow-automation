"""
Monitor/Reviewer Agent — Evaluates execution results and decides approval or retry.

This agent reviews all execution outputs against the original plan and expected
outcomes. It either approves the results (routing to final output) or rejects
them with corrective feedback (triggering a retry loop, up to 2 cycles).
"""

import json
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage


# ─────────────────────────────────────────────────────────────────────────────
# Monitor System Prompt
# ─────────────────────────────────────────────────────────────────────────────

MONITOR_SYSTEM_PROMPT = """You are the Monitor/Reviewer Agent in a multi-agent workflow automation system.

Your role is to evaluate execution results against the original plan and determine
whether the results are satisfactory.

**Rules:**
1. Check each execution step against expected outcomes from the plan.
2. Identify any errors, missing steps, or incomplete results.
3. Evaluate overall quality and completeness.
4. You SHOULD approve results that are reasonable and complete.
5. Only reject if there are clear, significant issues.
6. If rejecting, provide specific, actionable feedback for improvement.

**Current retry count: {retry_count} (max: 2)**
{retry_note}

**Output Format — YOU MUST return ONLY valid JSON, no markdown, no explanation:**
{{
    "decision": "approved" or "rejected",
    "quality_score": 1-10,
    "step_reviews": [
        {{
            "step_number": 1,
            "step_title": "Step title",
            "status": "pass" or "fail" or "warning",
            "comments": "Review comments for this step"
        }}
    ],
    "overall_assessment": "Detailed assessment of the execution results",
    "feedback": "Specific feedback for improvement (only if rejected, else null)",
    "final_output": "The complete, polished final output if approved (else null)"
}}
"""


# ─────────────────────────────────────────────────────────────────────────────
# Monitor Agent Function (LangGraph node)
# ─────────────────────────────────────────────────────────────────────────────

def monitor_agent(state: dict) -> dict:
    """
    LangGraph node: Monitor/Reviewer Agent.

    Reads plan and execution_results from state, evaluates quality,
    and writes monitor_decision, monitor_feedback, and potentially final_output.
    """
    plan = state["plan"]
    execution_results = state["execution_results"]
    retry_count = state.get("retry_count", 0)
    logs = list(state.get("agent_logs", []))

    logs.append({
        "agent": "Monitor",
        "type": "info",
        "message": f"Reviewing execution results (retry cycle: {retry_count}/2)...",
    })

    # Build retry context note
    if retry_count >= 2:
        retry_note = "This is the FINAL review — you MUST approve the results even if imperfect. Focus on the best possible final output."
    elif retry_count > 0:
        retry_note = f"This is retry {retry_count}. Be constructive but fair in your assessment."
    else:
        retry_note = "This is the first review. Evaluate thoroughly."

    system_prompt = MONITOR_SYSTEM_PROMPT.format(
        retry_count=retry_count,
        retry_note=retry_note,
    )

    user_message = (
        f"**Original Task:** {state['user_input']}\n\n"
        f"**Execution Plan:**\n{json.dumps(plan, indent=2)}\n\n"
        f"**Execution Results:**\n{json.dumps(execution_results, indent=2)}\n\n"
        f"Please review these results and make your decision."
    )

    # Call the LLM
    llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.3)
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_message),
    ]

    response = llm.invoke(messages)
    raw_output = response.content

    logs.append({
        "agent": "Monitor",
        "type": "llm_output",
        "message": raw_output,
    })

    # Parse monitor output
    try:
        clean = raw_output.strip()
        if clean.startswith("```"):
            clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]
            clean = clean.strip()
            if clean.startswith("json"):
                clean = clean[4:].strip()
        review = json.loads(clean)
    except json.JSONDecodeError:
        # On parse failure at max retries, approve; otherwise reject for retry
        if retry_count >= 2:
            review = {
                "decision": "approved",
                "quality_score": 7,
                "step_reviews": [],
                "overall_assessment": "Auto-approved after max retries.",
                "feedback": None,
                "final_output": json.dumps(execution_results, indent=2),
            }
        else:
            review = {
                "decision": "rejected",
                "quality_score": 5,
                "step_reviews": [],
                "overall_assessment": "Could not parse review output.",
                "feedback": "Please re-execute with clearer outputs.",
                "final_output": None,
            }
        logs.append({
            "agent": "Monitor",
            "type": "warning",
            "message": "Could not parse LLM output, using fallback decision.",
        })

    decision = review.get("decision", "approved")
    quality = review.get("quality_score", 7)

    # Force approval after max retries
    if retry_count >= 2 and decision == "rejected":
        decision = "approved"
        review["decision"] = "approved"
        review["final_output"] = review.get("final_output") or json.dumps(execution_results, indent=2)
        logs.append({
            "agent": "Monitor",
            "type": "info",
            "message": "Max retries reached — forcing approval.",
        })

    logs.append({
        "agent": "Monitor",
        "type": "decision",
        "message": f"Decision: {decision.upper()} (quality score: {quality}/10)",
    })

    if decision == "rejected":
        feedback = review.get("feedback", "Please improve the execution.")
        logs.append({
            "agent": "Monitor",
            "type": "feedback",
            "message": f"Feedback for retry: {feedback}",
        })
        return {
            **state,
            "monitor_decision": "rejected",
            "monitor_feedback": feedback,
            "retry_count": retry_count + 1,
            "agent_logs": logs,
        }
    else:
        final_output = review.get("final_output") or review.get("overall_assessment", "Task completed successfully.")
        logs.append({
            "agent": "Monitor",
            "type": "info",
            "message": "Results approved — generating final output.",
        })
        return {
            **state,
            "monitor_decision": "approved",
            "monitor_feedback": None,
            "final_output": final_output,
            "agent_logs": logs,
        }
