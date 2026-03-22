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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
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
            className="input-run-btn"
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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Execute Pipeline
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
