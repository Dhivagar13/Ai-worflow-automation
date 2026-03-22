from typing import Literal
from langgraph.graph import StateGraph, START, END
from decision_state import DecisionState

# Import nodes using relative imports or direct if in same folder
from decision_nodes.planner import planner_node
from decision_nodes.analyzer import analyzer_node
from decision_nodes.option_generator import option_generator_node
from decision_nodes.evaluator import evaluator_node
from decision_nodes.decision_maker import decision_maker_node
from decision_nodes.reviewer import reviewer_node

def router(state: DecisionState) -> Literal["evaluator", "__end__"]:
    """Determines if the graph should loop back or finish"""
    if not state.get("approved"):
        return "evaluator"
    return "__end__"

class DecisionGraph:
    """
    Decision Intelligence Graph
    Implements a multi-agent decision-making system with feedback loops
    """

    def __init__(self):
        self.builder = StateGraph(DecisionState)
        self._add_nodes()
        self._configure_graph()

    def _add_nodes(self):
        """Add all graph nodes"""
        self.builder.add_node("planner", planner_node)
        self.builder.add_node("analyzer", analyzer_node)
        self.builder.add_node("option_generator", option_generator_node)
        self.builder.add_node("evaluator", evaluator_node)
        self.builder.add_node("decision_maker", decision_maker_node)
        self.builder.add_node("reviewer", reviewer_node)

    def _configure_graph(self):
        """Configure graph edges and flow"""
        self.builder.add_edge(START, "planner")
        self.builder.add_edge("planner", "analyzer")
        self.builder.add_edge("analyzer", "option_generator")
        self.builder.add_edge("option_generator", "evaluator")
        self.builder.add_edge("evaluator", "decision_maker")
        self.builder.add_edge("decision_maker", "reviewer")

        # Conditional edge for feedback loop
        self.builder.add_conditional_edges(
            "reviewer",
            router
        )

    def compile(self):
        """Compile the graph using the builder"""
        return self.builder.compile()

def build_graph():
    """Build and return the compiled decision graph"""
    graph_obj = DecisionGraph()
    return graph_obj.compile()

if __name__ == '__main__':
    print("Building Decision Intelligence Graph...")
    graph = build_graph()
    print("Graph built successfully!")
