import sys
import os
from pathlib import Path

# Fix path resolution for nodes/state imports
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

from langgraph.checkpoint.memory import MemorySaver
from langchain_core.messages import HumanMessage, SystemMessage

from decision_state import DecisionState, create_initial_state
from decision_graph import build_graph

def create_system_prompt() -> SystemMessage:
    """Create system prompt for the decision agent"""
    return SystemMessage(content="""You are an AI Decision Intelligence Agent.
Your role is to help users make informed decisions by:
1. Breaking down their decision criteria
2. Analyzing key factors
3. Generating alternative options
4. Evaluating options against criteria
5. Selecting the best option
6. Validating the decision

Always be thoughtful, analytical, and transparent in your reasoning.
""")

def run_decision_platform(user_query: str):
    """Main execution entry point"""
    print("=" * 80)
    print("DECISION INTELLIGENCE PLATFORM")
    print("=" * 80)
    print(f"Query: {user_query}")
    print()

    # Build graph and state
    compiled_graph = build_graph()
    state = create_initial_state()
    memory = MemorySaver()

    # Prepare inputs
    state['input'] = user_query
    state['messages'] = [create_system_prompt(), HumanMessage(content=user_query)]

    # Thread config for memory (optional if not using persistence features)
    config = {"configurable": {"thread_id": "1"}}

    # Invoke graph
    result = compiled_graph.invoke(state, config=config)

    # Output results
    print("=" * 80)
    print("DECISION RESULTS")
    print("=" * 80)
    print(f"Final Decision: {result.get('decision', 'N/A')}")
    print(f"Reasoning: {result.get('decision_reasoning', 'N/A')}")
    print(f"Approved: {result.get('approved', 'N/A')}")
    print(f"Feedback: {result.get('feedback', 'N/A')}")
    
    evaluations = result.get('evaluation', [])
    if evaluations:
        print("\n" + "-" * 40)
        print(f"{'Option Name':<25} | {'Score':<5}")
        print("-" * 40)
        for eval_opt in evaluations:
            score = eval_opt.get('overall_score', 0.0)
            print(f"{eval_opt['option_name']:<25} | {score:>.2f}")

    return result

if __name__ == '__main__':
    query = "Help me decide whether to invest in a tech startup. Key factors: high growth, medium risk."
    run_decision_platform(query)
