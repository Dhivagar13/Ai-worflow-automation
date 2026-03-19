import React from 'react';
import './ThinkingIndicator.css';

export default function ThinkingIndicator({ stage }) {
  if (stage === 'idle' || stage === 'complete') return null;

  const getMessage = () => {
    switch (stage) {
      case 'planner': return "Planner is analyzing the request & devising strategy...";
      case 'tool_selector': return "Tool Selector is configuring API operations...";
      case 'executor': return "Executor is physically running the actions...";
      case 'monitor': return "Reviewer is checking quality & accuracy...";
      default: return "Agentic cluster is processing...";
    }
  };

  return (
    <div className={`thinking-indicator thinking-indicator--${stage}`}>
      <div className="thinking-indicator__pulse">
        <span></span><span></span><span></span>
      </div>
      <div className="thinking-indicator__text">{getMessage()}</div>
    </div>
  );
}
