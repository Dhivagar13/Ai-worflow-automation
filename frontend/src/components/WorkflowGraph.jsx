import React from 'react';
import './WorkflowGraph.css';

export default function WorkflowGraph({ stage, result }) {
  const steps = [
    { id: 'planner', label: 'Planner', icon: '🧠' },
    { id: 'tool_selector', label: 'Tool Selector', icon: '🔧' },
    { id: 'executor', label: 'Executor', icon: '⚡' },
    { id: 'monitor', label: 'Reviewer', icon: '🧐' },
  ];

  const getStepStatus = (stepId, index) => {
    if (stage === 'complete' || stage === 'idle') {
      if (result && stepId === 'monitor' && result.monitor_decision === 'rejected') {
        return 'rejected';
      }
      return result ? 'completed' : 'pending';
    }
    
    const stageIndex = steps.findIndex(s => s.id === stage);
    if (index < stageIndex) return 'completed';
    if (index === stageIndex) return 'active';
    return 'pending';
  };

  const hasRetry = result && result.retry_count > 0;
  const isRetrying = stage === 'executor' && hasRetry; // Simplistic visual for retry

  return (
    <div className="workflow-graph">
      <h3 className="workflow-graph__title">Agentic Execution Pipeline</h3>
      <div className="workflow-graph__nodes">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id, index);
          return (
            <React.Fragment key={step.id}>
              <div className={`workflow-node workflow-node--${status}`}>
                <div className="workflow-node__icon">{step.icon}</div>
                <div className="workflow-node__label">{step.label}</div>
                {status === 'active' && <div className="workflow-node__pulse"></div>}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`workflow-arrow workflow-arrow--${status}`}>
                  <div className="workflow-arrow__line"></div>
                  <div className="workflow-arrow__head">▶</div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Feedback Loop Visualization */}
      <div className={`workflow-loop ${hasRetry ? 'workflow-loop--visible' : ''} ${hasRetry && stage === 'complete' ? 'workflow-loop--red' : ''}`}>
        <svg viewBox="0 0 400 60" preserveAspectRatio="none">
          <path d="M 350,10 Q 380,50 200,50 T 50,10" fill="none" className="workflow-loop__path" />
          <polygon points="45,10 55,5 50,15" fill="currentColor" className="workflow-loop__arrow" />
        </svg>
        <div className="workflow-loop__label">
          {hasRetry ? `↻ Reviewer Rejected (${result.retry_count} Retries)` : ''}
        </div>
      </div>
    </div>
  );
}
