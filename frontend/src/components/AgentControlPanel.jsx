import React from 'react';
import './AgentControlPanel.css';

const agents = [
  { id: 'planner', name: 'Strategic Planner', icon: '🧠', color: 'var(--color-planner)' },
  { id: 'executor', name: 'Rapid Executor', icon: '⚡', color: 'var(--color-executor)' },
  { id: 'monitor', name: 'Critical Reviewer', icon: '🧐', color: 'var(--color-monitor)' },
];

export default function AgentControlPanel({ stage, result }) {
  const getStatus = (agentId) => {
    if (stage === 'complete' || !!result) return 'Completed';
    if (stage === agentId) return 'Running...';
    
    const stages = ['planner', 'tool_selector', 'executor', 'monitor'];
    const currentIdx = stages.indexOf(stage);
    const agentIdx = agentId === 'planner' ? 0 : agentId === 'executor' ? 2 : 3; // tool_selector is internal to executor for this view
    
    if (currentIdx > agentIdx) return 'Completed';
    return 'Idle';
  };

  const getOutput = (agentId) => {
    if (!result) return 'Awaiting initialization...';
    if (agentId === 'planner') return result.plan?.steps?.[0]?.title || 'Strategy formulated.';
    if (agentId === 'executor') return 'Tools utilized and task executed.';
    if (agentId === 'monitor') return result.monitor_decision || 'Validation logic completed.';
  };

  return (
    <div className="agent-control-panel">
      {agents.map((agent) => (
        <div key={agent.id} className={`agent-card glass ${getStatus(agent.id) === 'Running...' ? 'active' : ''}`}>
          <div className="agent-card__header">
            <span className="agent-card__icon" style={{ background: `${agent.color}20`, color: agent.color }}>
              {agent.icon}
            </span>
            <div className="agent-card__title">
              <h3>{agent.name}</h3>
              <span className={`status-badge ${getStatus(agent.id) === 'Running...' ? 'pulse' : ''}`}>
                {getStatus(agent.id)}
              </span>
            </div>
          </div>
          <div className="agent-card__body">
             <div className="agent-card__preview">
               {getOutput(agent.id)}
             </div>
          </div>
          <div className="agent-card__footer">
             <div className="progress-bar-container">
               <div 
                 className="progress-bar" 
                 style={{ 
                   width: getStatus(agent.id) === 'Completed' ? '100%' : getStatus(agent.id) === 'Running...' ? '60%' : '0%',
                   backgroundColor: agent.color
                 }} 
               />
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
