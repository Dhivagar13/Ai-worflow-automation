/**
 * PipelineIndicator — Visual indicator showing which stage of the workflow
 * pipeline is currently active.
 */
export default function PipelineIndicator({ stage }) {
  const stages = [
    { key: 'planner', label: '📋 Planner', className: 'planner' },
    { key: 'tool_selector', label: '🔧 Tool Selector', className: 'tool-selector' },
    { key: 'executor', label: '⚙️ Executor', className: 'executor' },
    { key: 'monitor', label: '🔍 Monitor', className: 'monitor' },
  ]

  const stageOrder = ['idle', 'planner', 'tool_selector', 'executor', 'monitor', 'complete']
  const currentIndex = stageOrder.indexOf(stage)

  if (stage === 'idle') return null

  return (
    <div className="pipeline">
      {stages.map((s, i) => {
        const sIndex = stageOrder.indexOf(s.key)
        const isActive = stage === s.key
        const isCompleted = currentIndex > sIndex

        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
            <span className={`pipeline__step pipeline__step--${s.className} ${
              isActive ? 'pipeline__step--active' : ''
            } ${isCompleted ? 'pipeline__step--completed' : ''}`}>
              {isCompleted ? '✓ ' : ''}{s.label}
            </span>
            {i < stages.length - 1 && (
              <span className={`pipeline__arrow ${isCompleted ? 'pipeline__arrow--active' : ''}`}>
                →
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
