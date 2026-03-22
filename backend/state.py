from typing import TypedDict, List, Optional, Dict, Any

class AgentState(TypedDict):
    """
    Shared state schema for the multi-agent workflow automation system.
    """
    user_input: str
    plan: Optional[Dict[str, Any]]
    tool_selections: Optional[Dict[str, Any]]
    execution_results: Optional[Dict[str, Any]]
    monitor_decision: Optional[str]
    monitor_feedback: Optional[str]
    retry_count: int
    agent_logs: List[Dict[str, Any]]
    final_output: Optional[Any]
