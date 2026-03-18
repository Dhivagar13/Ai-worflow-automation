/**
 * FinalOutput — Displays the approved final result from the Monitor Agent.
 * Shows decision status, quality score, retry count, and execution time.
 */
export default function FinalOutput({ result }) {
  if (!result || !result.final_output) return null

  return (
    <div className="panel final-output" id="final-output-panel">
      <div className="panel__header" style={{ color: 'var(--color-success)' }}>
        <span className="panel__header-icon" style={{
          background: 'var(--color-success-bg)',
          border: '1px solid rgba(52, 211, 153, 0.3)',
        }}>✅</span>
        <span>Final Output — Approved by Monitor</span>
      </div>

      <div className="final-output__content">
        {result.final_output}
      </div>

      <div className="final-output__meta">
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
    </div>
  )
}
