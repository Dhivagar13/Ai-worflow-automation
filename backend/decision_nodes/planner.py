from decision_state import DecisionState

def planner_node(state: DecisionState) -> DecisionState:
    """
    Planner Node: Breaks user input into structured decision criteria

    Takes raw user query and structures it into actionable criteria
    """
    user_input = state.get('input', '')
    if not user_input and state.get('messages'):
        # Fallback to last human message if input is empty
        for msg in reversed(state['messages']):
            if hasattr(msg, 'content'):
                user_input = msg.content
                break

    # Parse user intent
    intent = str(user_input).strip()

    # Extract structured criteria based on intent
    if 'job' in intent.lower() or 'career' in intent.lower():
        criteria = [
            'job security',
            'salary and benefits',
            'work-life balance',
            'growth opportunities',
            'company culture',
            'location flexibility'
        ]
    elif 'travel' in intent.lower() or 'vacation' in intent.lower():
        criteria = [
            'cost',
            'duration',
            'destinations',
            'accommodation quality',
            'activities',
            'budget'
        ]
    else:
        # Generic decision criteria
        criteria = [
            'cost',
            'benefits',
            'risk',
            'effort required',
            'time to achieve',
            'compatibility'
        ]

    state['plan'] = criteria
    return state
