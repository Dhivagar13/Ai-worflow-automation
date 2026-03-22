from decision_state import DecisionState

def decision_maker_node(state: DecisionState) -> DecisionState:
    """
    Decision Maker Node: Selects best option with reasoning

    Picks optimal option based on evaluation scores and user preferences
    """
    evaluation_list = state.get('evaluation', [])

    if not evaluation_list:
        state['decision'] = None
        state['decision_reasoning'] = 'No evaluations available to make a decision.'
        return state

    # Find highest scoring option
    best_option = None
    best_score = -1

    for eval_item in evaluation_list:
        if eval_item['overall_score'] > best_score:
            best_score = eval_item['overall_score']
            best_option = eval_item

    if best_option:
        state['decision'] = best_option['option_name']
        reasoning = f"Selected {best_option['option_name']} based on evaluation score of {best_score:.2f}. "
        reasoning += f"Key benefits: {', '.join(best_option['pros'][:2])}. "
        reasoning += f"Trade-offs: {', '.join(best_option['cons'][:1])}."
        state['decision_reasoning'] = reasoning
    else:
        state['decision'] = 'No suitable option found'
        state['decision_reasoning'] = 'Evaluation failed to produce a valid recommendation.'

    return state
