import { useState } from 'react';

/**
 * FinalOutput — Displays the approved final result from the Monitor Agent.
 * Shows decision status, quality score, retry count, and execution time.
 */
export default function FinalOutput({ result }) {
  const [copied, setCopied] = useState(false);

  if (!result || !result.final_output) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(result.final_output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadNode = document.createElement('a');
    downloadNode.setAttribute("href", dataStr);
    downloadNode.setAttribute("download", "agentic_workflow_result.json");
    document.body.appendChild(downloadNode);
    downloadNode.click();
    downloadNode.remove();
  };

  return (
    <div className="panel final-output" id="final-output-panel">
      <div className="panel__header" style={{ color: 'var(--color-success)' }}>
        <span className="panel__header-icon" style={{
          background: 'var(--color-success-bg)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
        }}>✅</span>
        <span>Final Output — Approved by Monitor</span>
      </div>

      <div className="final-output__content" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', padding: 'var(--space-md)', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
        {result.final_output}
      </div>

      <div className="final-output__meta" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
          <span className="final-output__meta-item final-output__meta-item--approved">
            ✓ {result.monitor_decision === 'approved' ? 'Approved' : result.monitor_decision}
          </span>
          <span className="final-output__meta-item">
            🔄 Retries: {result.retry_count || 0}
          </span>
          {result.execution_time_seconds && (
            <span className="final-output__meta-item">
              ⏱️ {result.execution_time_seconds.toFixed(2)}s
            </span>
          )}
          <span className="final-output__meta-item">
            📊 {result.agent_logs?.length || 0} log entries
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <button 
             onClick={handleCopy}
             style={{ background: 'transparent', border: '1px solid var(--border-primary)', color: 'var(--text-accent)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
             onMouseOver={(e) => {e.target.style.background = 'var(--text-accent)'; e.target.style.color = '#000'}}
             onMouseOut={(e) => {e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-accent)'}}
          >
            {copied ? 'Copied! ✓' : '📋 Copy Text'}
          </button>
          <button 
             onClick={handleDownload}
             style={{ background: 'var(--color-info-bg)', border: '1px solid var(--color-info-border, var(--color-info))', color: 'var(--color-info)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', transition: 'all 0.2s' }}
             onMouseOver={(e) => {e.target.style.background = 'var(--color-info)'; e.target.style.color = '#000'}}
             onMouseOut={(e) => {e.target.style.background = 'var(--color-info-bg)'; e.target.style.color = 'var(--color-info)'}}
          >
            💾 Download JSON
          </button>
        </div>
      </div>
    </div>
  )
}
