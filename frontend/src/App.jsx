import { useState } from 'react'
import './App.css'

import InputSection from './components/InputSection'
import PipelineIndicator from './components/PipelineIndicator'
import PlanDisplay from './components/PlanDisplay'
import ToolSelections from './components/ToolSelections'
import ExecutionTrace from './components/ExecutionTrace'
import MonitorReview from './components/MonitorReview'
import AgentLogs from './components/AgentLogs'
import FinalOutput from './components/FinalOutput'

const API_BASE = 'http://localhost:8000'

/**
 * App — Main application component for the Agentic AI Workflow Engine.
 * 
 * Orchestrates the UI, sends tasks to the backend, and displays results
 * from all 4 agents (Planner, Tool Selector, Executor, Monitor).
 */
function App() {
  const [isLoading, setIsLoading] = useState(false)
  const [pipelineStage, setPipelineStage] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  /**
   * Submit a task to the backend workflow engine.
   * The backend runs the full LangGraph pipeline and returns all results.
   */
  const handleSubmit = async (task) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setPipelineStage('planner')

    try {
      // Simulate pipeline progression for visual feedback
      const stageTimers = [
        setTimeout(() => setPipelineStage('tool_selector'), 3000),
        setTimeout(() => setPipelineStage('executor'), 7000),
        setTimeout(() => setPipelineStage('monitor'), 12000),
      ]

      const response = await fetch(`${API_BASE}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task }),
      })

      // Clear stage timers
      stageTimers.forEach(clearTimeout)

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.success) {
        setError(data.error || 'Workflow failed. Check the logs for details.')
      }

      setResult(data)
      setPipelineStage('complete')

    } catch (err) {
      setError(
        err.message.includes('Failed to fetch')
          ? 'Cannot connect to backend. Make sure the server is running on http://localhost:8000'
          : err.message
      )
      setPipelineStage('idle')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__badge">
          <span className="header__badge-dot" />
          LangGraph Multi-Agent System
        </div>
        <h1 className="header__title">Agentic AI Workflow Engine</h1>
        <p className="header__subtitle">
          Multi-agent coordination with dynamic planning, intelligent execution, 
          and automated review — powered by LangGraph orchestration
        </p>
      </header>

      {/* Task Input */}
      <InputSection onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Pipeline Stage Indicator */}
      {(isLoading || pipelineStage !== 'idle') && (
        <PipelineIndicator stage={pipelineStage} />
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 24px',
          padding: '16px 20px',
          background: 'var(--color-error-bg)',
          border: '1px solid rgba(248, 113, 113, 0.3)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-error)',
          fontSize: '0.9rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          ❌ <strong>Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && !result && (
        <div className="results-grid">
          <div className="loading-overlay">
            <div className="loading-spinner" />
            <div className="loading-text">
              Agents are processing your task
              <span className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </div>
            <div className="loading-subtext">
              Planner → Tool Selector → Executor → Monitor
            </div>
          </div>
        </div>
      )}

      {/* Results Grid */}
      {result && (
        <div className="results-grid">
          {/* Row 1: Plan + Tool Selections */}
          <PlanDisplay plan={result.plan} />
          <ToolSelections toolSelections={result.tool_selections} />

          {/* Row 2: Execution Trace + Monitor Review */}
          <ExecutionTrace executionResults={result.execution_results} />
          <MonitorReview
            executionResults={result.execution_results}
            monitorDecision={result.monitor_decision}
            monitorFeedback={result.monitor_feedback}
            retryCount={result.retry_count}
          />

          {/* Full Width: Agent Logs */}
          <AgentLogs logs={result.agent_logs} />

          {/* Full Width: Final Output */}
          <FinalOutput result={result} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !result && !error && (
        <div className="results-grid">
          <div className="empty-state">
            <div className="empty-state__icon">🤖</div>
            <div className="empty-state__text">
              Enter a task above to start the agentic workflow
            </div>
            <div className="empty-state__subtext">
              The system will plan, select tools, execute, and review your task automatically
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
