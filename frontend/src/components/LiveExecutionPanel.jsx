import React, { useEffect, useRef, useState } from 'react';
import './LiveExecutionPanel.css';

export default function LiveExecutionPanel({ logs, isRunning }) {
  const terminalRef = useRef(null);
  
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="live-execution-panel glass animate-fade">
      <div className="panel-header">
         <div className="status-dots">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
         </div>
         <span className="panel-title">System Execution Terminal (v1.0.4)</span>
         <span className="panel-status">{isRunning ? 'UPDATING...' : 'IDLE'}</span>
      </div>

      <div className="panel-body terminal-mode" ref={terminalRef}>
         {logs.length === 0 ? (
           <div className="terminal-prompt">
              <span className="cursor">_</span> system standing by for instruction...
           </div>
         ) : (
           <div className="terminal-logs">
              {logs.map((log, idx) => (
                <div key={idx} className={`terminal-log-line ${log.type?.toLowerCase()}`}>
                   <span className="timestamp">{log.timestamp || new Date().toLocaleTimeString()}</span>
                   <span className="agent">[{log.agent || 'SYSTEM'}]</span>
                   <span className="message">{log.message}</span>
                </div>
              ))}
              {isRunning && (
                <div className="terminal-log-line placeholder animate-pulse">
                  <span className="cursor">_</span> execution streaming...
                </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
}
