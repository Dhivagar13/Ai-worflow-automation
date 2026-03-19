import React, { useState } from 'react';
import './AgentTimeline.css';

function TimelineMessage({ log }) {
  const [expanded, setExpanded] = useState(false);

  // Try to cleanly format JSON if it's a raw dump
  let content = log.message;
  let isJson = false;

  try {
    if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
      const parsed = JSON.parse(content);
      content = JSON.stringify(parsed, null, 2);
      isJson = true;
    } else if (typeof content === 'object') {
      content = JSON.stringify(content, null, 2);
      isJson = true;
    }
  } catch (e) {
    // leave as string
  }

  // If it's a huge text/json payload, make it collapsible
  const isLarge = content && content.length > 150;

  if (log.type === 'llm_output' || log.type === 'tool_result' || isJson) {
    return (
      <div className="timeline-message">
        {isLarge && !expanded ? (
           <div className="timeline-message__summary">
             <span style={{color: 'var(--text-muted)'}}>{isJson ? 'Status: JSON Payload generated' : 'Status: Data payload generated'}</span>
             <button className="timeline-message__toggle" onClick={() => setExpanded(true)}>View Payload</button>
           </div>
        ) : (
           <div className="timeline-message__full">
             <pre className="timeline-message__code">{content}</pre>
             {isLarge && (
               <button className="timeline-message__toggle timeline-message__toggle--collapse" onClick={() => setExpanded(false)}>Hide Payload</button>
             )}
           </div>
        )}
      </div>
    );
  }

  return <div className="timeline-message"><span>{content}</span></div>;
}

export default function AgentTimeline({ logs }) {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="agent-timeline">
      <div className="agent-timeline__header">
        <span className="icon">⏱️</span> 
        <span>Agent Timeline</span>
        <span className="count">{logs.length} Operations</span>
      </div>
      <div className="agent-timeline__body">
        <div className="timeline-line"></div>
        {logs.map((log, index) => (
          <div key={index} className="timeline-item" style={{ animationDelay: `${index * 0.1}s` }}>
            <div className={`timeline-dot timeline-dot--${log.agent}`}></div>
            <div className="timeline-content">
              <div className="timeline-content__top">
                <span className={`timeline-agent tag--${log.agent}`}>{log.agent}</span>
                <span className="timeline-type">{log.type.replace('_', ' ')}</span>
              </div>
              <TimelineMessage log={log} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
