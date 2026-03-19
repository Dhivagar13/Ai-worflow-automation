import React from 'react';
import './AgentConversationPanel.css';

export default function AgentConversationPanel({ logs }) {
  if (logs.length === 0) return null;

  return (
    <div className="agent-conversation-panel glass animate-fade">
      <div className="conv-header">
        <span className="conv-title">Active Multi-Agent Sync Channel</span>
        <div className="conv-badges">
          <span className="badge planner">Strategic P.</span>
          <span className="badge executor">Rapid E.</span>
          <span className="badge monitor">Critical R.</span>
        </div>
      </div>
      
      <div className="conv-body">
        {logs.map((log, idx) => {
          const isSystem = !log.agent || log.agent === 'SYSTEM';
          return (
            <div key={idx} className={`conv-message ${isSystem ? 'system' : ''}`}>
              {!isSystem && <div className="conv-message__author" style={{ color: log.agent === 'Planner' ? 'var(--color-planner)' : log.agent === 'Executor' ? 'var(--color-executor)' : 'var(--color-monitor)' }}>
                 {log.agent}
              </div>}
              <div className="conv-message__content">
                 {log.message}
              </div>
              <div className="conv-message__meta">
                 {log.timestamp || new Date().toLocaleTimeString()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
