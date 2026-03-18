/**
 * ExecutionTrace — Shows each execution step, tools used, and results.
 */
export default function ExecutionTrace({ executionResults }) {
  if (!executionResults) return null

  const summary = executionResults.execution_summary || []

  return (
    <div className="panel" id="execution-panel">
      <div className="panel__header panel__header--executor">
        <span className="panel__header-icon">⚙️</span>
        <span>Execution Trace</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>
          {executionResults.overall_status || 'running'}
        </span>
      </div>
      <div className="panel__body">
        {summary.map((step, i) => (
          <div key={step.step_number || i} className="exec-step">
            <div className="exec-step__header">
              <span className="exec-step__title">
                Step {step.step_number}: {step.step_title}
              </span>
              <span className={`exec-step__status exec-step__status--${step.status || 'completed'}`}>
                {step.status || 'completed'}
              </span>
            </div>

            <div className="exec-step__tools">
              {(step.tools_used || []).map((tool, j) => (
                <span key={j} className="exec-step__tool-badge">{tool}</span>
              ))}
            </div>

            <div className="exec-step__summary">
              {step.summary}
            </div>

            {step.issues && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                background: 'var(--color-warning-bg)',
                borderRadius: '6px',
                fontSize: '0.78rem',
                color: 'var(--color-warning)',
              }}>
                ⚠️ {step.issues}
              </div>
            )}
          </div>
        ))}

        {executionResults.overall_summary && (
          <div className="plan__reasoning" style={{ borderColor: 'var(--color-executor-border)' }}>
            <strong>📊 Overall:</strong> {executionResults.overall_summary}
          </div>
        )}
      </div>
    </div>
  )
}
