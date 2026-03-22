from decision_state import DecisionState

def reviewer_node(state: DecisionState) -> DecisionState:
    """
    Reviewer Node: Validates decision and checks for improvements

    Reviews the selected decision and provides feedback for refinement
    """
    decision = state.get('decision')
    reasoning = state.get('decision_reasoning', '')

    feedback = None
    approved = True

    # Simple validation logic
    if decision is None:
        feedback = "Decision not made. Please revisit the evaluation phase."
        approved = False
    elif 'No suitable' in decision or 'Evaluation failed' in decision:
        feedback = "Decision appears invalid. Need to regenerate or re-evaluate options."
        approved = False
    else:
        feedback = f"Decision '{decision}' has been validated. Reasoning: {reasoning}"

    state['feedback'] = feedback
    state['approved'] = approved

    return state
