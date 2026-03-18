import { useState } from 'react'

/**
 * InputSection — Text input for user to enter their natural language task.
 * Includes example task chips for quick selection.
 */
export default function InputSection({ onSubmit, isLoading }) {
  const [task, setTask] = useState('')

  const exampleTasks = [
    'Send a weekly report email to the team with sales data',
    'Analyze customer feedback data and generate insights report',
    'Schedule a recurring backup and notify the admin upon completion',
    'Process incoming orders, validate, and update inventory',
  ]

  const handleSubmit = () => {
    if (task.trim() && !isLoading) {
      onSubmit(task.trim())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit()
    }
  }

  return (
    <section className="input-section">
      <div className="input-section__card">
        <label className="input-section__label">
          <span>⚡</span>
          <span>Define Your Task</span>
        </label>

        <textarea
          id="task-input"
          className="input-section__textarea"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe a task in natural language... e.g., 'Send a weekly report email to the team with this week's sales data'"
          disabled={isLoading}
        />

        <div className="input-section__actions">
          <span className="input-section__hint">
            Ctrl + Enter to submit
          </span>
          <button
            id="submit-btn"
            className="input-section__btn"
            onClick={handleSubmit}
            disabled={isLoading || !task.trim()}
          >
            {isLoading ? (
              <>
                <span className="input-section__btn-spinner" />
                Processing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Run Workflow
              </>
            )}
          </button>
        </div>

        <div className="examples">
          {exampleTasks.map((example, i) => (
            <button
              key={i}
              className="examples__chip"
              onClick={() => setTask(example)}
              disabled={isLoading}
            >
              {example.length > 50 ? example.slice(0, 50) + '…' : example}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
