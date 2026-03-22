from decision_state import DecisionState

def evaluator_node(state: DecisionState) -> DecisionState:
    """
    Evaluator Node: Compares options (pros/cons, scoring)

    Evaluates each option against criteria and assigns scores
    """
    options = state.get('options', [])
    if not options:
        return state

    # Scoring weights
    weights = {
        'cost': 0.25,
        'risk': 0.30,
        'effort': 0.20,
        'time': 0.15,
        'innovation': 0.10
    }

    evaluations = []

    # Evaluate each option
    for option in options:
        evaluation = {
            'option_id': option['id'],
            'option_name': option['name'],
            'description': option['description'],
            'pros': [],
            'cons': [],
            'scores': {},
            'overall_score': 0
        }

        # Generate pros and cons based on attributes
        attrs = option.get('attributes', {})
        risk = attrs.get('risk', 'medium')
        effort = attrs.get('effort', 'moderate')

        if 'low' in risk:
            evaluation['pros'].append('Low risk, suitable for stable environments')
            evaluation['cons'].append('May miss out on high-growth opportunities')
            evaluation['scores']['risk'] = 0.9
        elif 'high' in risk:
            evaluation['pros'].append('High potential for significant gains')
            evaluation['cons'].append('Requires substantial resources and tolerance for risk')
            evaluation['scores']['risk'] = 0.3
        else:
            evaluation['pros'].append('Balanced risk-reward profile')
            evaluation['cons'].append('May not be optimal for all risk preferences')
            evaluation['scores']['risk'] = 0.6

        # Add effort-based evaluation
        if 'low' in effort:
            evaluation['pros'].append('Manageable resource requirements')
            evaluation['scores']['effort'] = 0.8
        else:
            evaluation['pros'].append('Scalable for larger projects')
            evaluation['scores']['effort'] = 0.5

        # Calculate weighted score
        total_score = 0
        weight_sum = 0
        for attr, score in evaluation['scores'].items():
            weight = weights.get(attr, 0.1)
            contribution = score * weight
            total_score += contribution
            weight_sum += weight

        evaluation['overall_score'] = total_score / weight_sum if weight_sum > 0 else 0.5
        evaluations.append(evaluation)

    state['evaluation'] = evaluations
    return state
