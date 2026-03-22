"""
FastAPI Server — Exposes the Agentic Workflow Engine via REST API.

Endpoints:
  POST /api/run       — Execute the full workflow with a user task
  GET  /api/health    — Health check
"""

import os
import json
import traceback
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from backend.graph.workflow import build_workflow

# Load environment variables (from the same directory as server.py)
env_path = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=env_path)

# Validate API keys are available
if not os.getenv("OPENAI_API_KEY") and not os.getenv("GROQ_API_KEY"):
    print("⚠️  WARNING: Neither OPENAI_API_KEY nor GROQ_API_KEY set in environment.")

# ─────────────────────────────────────────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Agentic AI Workflow Automation Engine",
    description="Multi-agent LangGraph orchestration system with Planner, Tool Selector, Executor, and Monitor agents.",
    version="1.0.0",
)


# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response Models
# ─────────────────────────────────────────────────────────────────────────────

class WorkflowRequest(BaseModel):
    task: str


class WorkflowResponse(BaseModel):
    success: bool
    user_input: str
    plan: dict | None = None
    tool_selections: dict | None = None
    execution_results: dict | None = None
    monitor_feedback: str | None = None
    monitor_decision: str | None = None
    final_output: str | dict | list | None = None
    retry_count: int = 0
    agent_logs: list = []
    error: str | None = None
    execution_time_seconds: float | None = None
    # Enhanced attributes matching advanced orchestration format
    intent: str = ""
    agents_used: list = []
    tools_used: list = []
    execution: list = []
    validation: dict = {}


# ─────────────────────────────────────────────────────────────────────────────
# Build the workflow graph once at startup
# ─────────────────────────────────────────────────────────────────────────────

print("🔧 Building LangGraph workflow...")
workflow_graph = build_workflow()
print("✅ Workflow graph compiled successfully!")


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    """Root endpoint for basic browser pings."""
    return {"message": "Agentic AI Workflow Engine Backend is Online. Please route requests to /api/run"}

@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Agentic AI Workflow Engine",
        "timestamp": datetime.now().isoformat(),
    }


@app.post("/api/run", response_model=WorkflowResponse)
def run_workflow(request: WorkflowRequest):
    """
    Execute the full agentic workflow for a given task.

    Flow: Planner → Tool Selector → Executor → Monitor (with retry loop)
    """
    if not request.task or not request.task.strip():
        raise HTTPException(status_code=400, detail="Task cannot be empty")

    start_time = datetime.now()

    # Initialize the shared state
    initial_state = {
        "user_input": request.task.strip(),
        "plan": None,
        "tool_selections": None,
        "execution_results": None,
        "monitor_feedback": None,
        "monitor_decision": None,
        "final_output": None,
        "retry_count": 0,
        "agent_logs": [],
    }

    try:
        # Run the LangGraph workflow
        print(f"\n{'='*60}")
        print(f"🚀 Starting workflow for task: {request.task[:80]}...")
        print(f"{'='*60}")

        result = workflow_graph.invoke(initial_state)

        elapsed = (datetime.now() - start_time).total_seconds()
        print(f"✅ Workflow completed in {elapsed:.2f}s — Decision: {result.get('monitor_decision', 'N/A')}")

        # Extract structured data to match advanced JSON output schema requirements
        intent = result.get("plan", {}).get("task_summary", request.task) if result.get("plan") else request.task
        plan_list = []
        if result.get("plan") and result.get("plan").get("steps"):
            plan_list = [step.get("description", step.get("title", "")) for step in result["plan"]["steps"]]
            
        agents_used = ["Planner", "Tool Selector", "Executor", "Monitor"]
        
        tools_used = []
        if result.get("tool_selections") and result.get("tool_selections").get("tool_selections"):
            for step_tools in result["tool_selections"]["tool_selections"]:
                for tool in step_tools.get("selected_tools", []):
                    tool_name = tool.get("tool_name")
                    if tool_name not in tools_used:
                        tools_used.append(tool_name)
                        
        execution_list = []
        if result.get("execution_results") and result.get("execution_results").get("execution_summary"):
            execution_list = result["execution_results"]["execution_summary"]
            
        validation = {
            "issues_found": result.get("monitor_feedback", "None identified"),
            "improvements_made": "Corrected iteratively" if result.get("retry_count", 0) > 0 else "None required"
        }

        # Instead of just outputting text, let's embed the exact JSON structure into `final_output` for UI to display it correctly
        structured_json = {
            "intent": intent,
            "plan": plan_list,
            "agents_used": agents_used,
            "tools_used": tools_used,
            "execution": execution_list,
            "validation": validation,
            "final_output": result.get("final_output", "")
        }
        
        formatted_final_output = json.dumps(structured_json, indent=2)

        return WorkflowResponse(
            success=True,
            user_input=result.get("user_input", request.task),
            plan=result.get("plan"),
            tool_selections=result.get("tool_selections"),
            execution_results=result.get("execution_results"),
            monitor_feedback=result.get("monitor_feedback"),
            monitor_decision=result.get("monitor_decision"),
            final_output=formatted_final_output,
            retry_count=result.get("retry_count", 0),
            agent_logs=result.get("agent_logs", []),
            execution_time_seconds=elapsed,
            intent=intent,
            agents_used=agents_used,
            tools_used=tools_used,
            execution=execution_list,
            validation=validation
        )

    except Exception as e:
        elapsed = (datetime.now() - start_time).total_seconds()
        error_msg = f"{type(e).__name__}: {str(e)}"
        print(f"❌ Workflow failed: {error_msg}")
        traceback.print_exc()

        return WorkflowResponse(
            success=False,
            user_input=request.task,
            error=error_msg,
            agent_logs=initial_state.get("agent_logs", []),
            execution_time_seconds=elapsed,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Run server
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.server:app", host="0.0.0.0", port=8000, reload=True)
