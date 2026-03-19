import React from 'react';
import './AgentControlPanel.css';

const agents = [
  { id: 'planner', name: 'Strategic Planner', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>, color: 'var(--color-planner)' },
  { id: 'executor', name: 'Rapid Executor', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>, color: 'var(--color-executor)' },
  { id: 'monitor', name: 'Critical Reviewer', icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>, color: 'var(--color-monitor)' },
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
