from decision_state import DecisionState

def option_generator_node(state: DecisionState) -> DecisionState:
    """
    Option Generator Node: Generates multiple possible options

    Creates at least 3 distinct options based on analyzed criteria
    """
    # Create diverse options
    base_options = [
        {
            'name': 'Conservative Approach',
            'description': 'Lower risk, slower progress',
            'attributes': {'risk': 'low', 'cost': 'low', 'effort': 'moderate'}
        },
        {
            'name': 'Balanced Approach',
            'description': 'Moderate risk with reasonable returns',
            'attributes': {'risk': 'medium', 'cost': 'medium', 'effort': 'high'}
        },
        {
            'name': 'Aggressive Approach',
            'description': 'High risk, high potential reward',
            'attributes': {'risk': 'high', 'cost': 'high', 'effort': 'very high'}
        }
    ]

    # Add a 4th option for variety
    base_options.append({
        'name': 'Innovative Approach',
        'description': 'Unconventional method with unique advantages',
        'attributes': {'risk': 'medium-high', 'cost': 'moderate', 'effort': 'high'}
    })

    generated_options = []
    for i, option in enumerate(base_options, 1):
        generated_options.append({
            'id': i,
            'name': option['name'],
            'description': option['description'],
            'attributes': option['attributes']
        })

    state['options'] = generated_options
    return state
