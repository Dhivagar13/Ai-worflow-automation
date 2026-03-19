/**
 * ToolSelections — Shows which tools were selected for each plan step.
 */
export default function ToolSelections({ toolSelections }) {
  if (!toolSelections) return null

  const selections = toolSelections.tool_selections || []

  return (
    <div className="panel" id="tool-selections-panel">
      <div className="panel__header panel__header--tool-selector">
        <span className="panel__header-icon">🔧</span>
        <span>Tool Selections</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>
          {selections.length} steps mapped
        </span>
      </div>
      <div className="panel__body">
        {selections.map((sel, i) => (
          <div key={sel.step_number || i} className="tool-step">
            <div className="tool-step__title">
              Step {sel.step_number}: {sel.step_title}
            </div>
            {(sel.selected_tools || []).map((tool, j) => (
              <div key={j} className="tool-item" style={{ flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', width: '100%' }}>
                  <span className="tool-item__name">{tool.tool_name}</span>
                  <span className="tool-item__reason">{tool.reason}</span>
                </div>
                {tool.parameters && Object.keys(tool.parameters).length > 0 && (
                  <div style={{ width: '100%', marginTop: '4px', background: 'rgba(0,0,0,0.3)', padding: '6px', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Parameters:</div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: 'var(--text-secondary)' }}>
                      {JSON.stringify(tool.parameters, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {toolSelections.reasoning && (
          <div className="plan__reasoning" style={{ borderColor: 'var(--color-tool-selector-border)' }}>
            <strong>💡 Selection strategy:</strong> {toolSelections.reasoning}
          </div>
        )}
      </div>
    </div>
  )
}
