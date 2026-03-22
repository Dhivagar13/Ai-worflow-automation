from typing import TypedDict, List, Optional, Dict, Any, Annotated
from langgraph.graph import add_messages

class DecisionState(TypedDict):
    """State schema for AI Decision Intelligence Platform"""
    input: str
    plan: List[str]
    factors: List[Dict[str, str]]
    options: List[Dict[str, Any]]
    evaluation: List[Dict[str, Any]]
    decision: Optional[str]
    decision_reasoning: Optional[str]
    feedback: Optional[str]
    approved: bool
    messages: Annotated[list, add_messages]

def create_initial_state() -> DecisionState:
    """Factory function to initialize state"""
    return {
        'input': '',
        'plan': [],
        'factors': [],
        'options': [],
        'evaluation': [],
        'decision': None,
        'decision_reasoning': None,
        'feedback': None,
        'approved': False,
        'messages': []
    }
