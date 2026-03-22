import re
from decision_state import DecisionState

def analyzer_node(state: DecisionState) -> DecisionState:
    """
    Analyzer Node: Extracts key factors like cost, risk, benefits

    Analyzes each criterion from the plan and identifies relevant factors
    """
    plan = state.get('plan', [])

    if not plan:
        state['plan'] = ['cost', 'risk', 'time']
        plan = state['plan']

    # Generate key factors based on criteria
    factors_mapping = {
        'cost': {'factor': 'budget', 'description': 'Financial impact'},
        'risk': {'factor': 'probability', 'description': 'Likelihood of failure'},
        'benefits': {'factor': 'value', 'description': 'Expected gain'},
        'security': {'factor': 'stability', 'description': 'Long-term viability'},
        'time': {'factor': 'efficiency', 'description': 'Speed of execution'},
        'effort': {'factor': 'resource', 'description': 'Required investment'},
        'salary': {'factor': 'compensation', 'description': 'Monthly/Annual pay'},
        'balance': {'factor': 'well-being', 'description': 'Quality of life impact'}
    }

    # Match plan criteria to factors
    extracted_factors = []
    seen_factors = set()

    for criterion in plan:
        for key, value in factors_mapping.items():
            if key in criterion.lower() and value['factor'] not in seen_factors:
                extracted_factors.append(value)
                seen_factors.add(value['factor'])

    # If no match, use defaults
    if not extracted_factors:
        extracted_factors = [
            {'factor': 'budget', 'description': 'Initial investment'},
            {'factor': 'time', 'description': 'Execution timeline'},
            {'factor': 'risk', 'description': 'Potential downsides'}
        ]

    state['factors'] = extracted_factors
    return state
