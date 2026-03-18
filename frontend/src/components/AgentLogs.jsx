import { useState } from 'react'

/**
 * AgentLogs — Real-time display of ALL agent reasoning, decisions, and feedback.
 * This is the critical panel showing the intelligence and decision-making of each agent.
 * 
 * Log types: info, reasoning, llm_output, decision, action, tool_result, feedback, warning
 */

const AGENT_CLASS_MAP = {
  'Planner': 'planner',
  'Tool Selector': 'tool-selector',
  'Executor': 'executor',
  'Monitor': 'monitor',
}

const MAX_SHORT_LENGTH = 200

export default function AgentLogs({ logs }) {
  const [expandedLogs, setExpandedLogs] = useState({})
  const [filterAgent, setFilterAgent] = useState('all')

  if (!logs || logs.length === 0) return null

  const toggleExpand = (index) => {
    setExpandedLogs(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const filteredLogs = filterAgent === 'all'
    ? logs
    : logs.filter(log => log.agent === filterAgent)

  const agents = [...new Set(logs.map(l => l.agent))]

  return (
    <div className="panel panel--full-width logs-panel" id="logs-panel">
      <div className="panel__header" style={{ color: 'var(--text-accent)' }}>
        <span className="panel__header-icon" style={{
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}>🧠</span>
        <span>Agent Reasoning & Logs</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.6 }}>
          {filteredLogs.length} entries
        </span>
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-secondary)',
        flexWrap: 'wrap',
      }}>
        <button
          className="examples__chip"
          style={filterAgent === 'all' ? {
            background: 'rgba(99, 102, 241, 0.2)',
            color: 'var(--text-accent)',
            borderColor: 'var(--border-glow)',
          } : {}}
          onClick={() => setFilterAgent('all')}
        >
          All
        </button>
        {agents.map(agent => (
          <button
            key={agent}
            className="examples__chip"
            style={filterAgent === agent ? {
              background: 'rgba(99, 102, 241, 0.2)',
              color: 'var(--text-accent)',
              borderColor: 'var(--border-glow)',
            } : {}}
            onClick={() => setFilterAgent(agent)}
          >
            {agent}
          </button>
        ))}
      </div>

      <div className="panel__body">
        {filteredLogs.map((log, i) => {
          const agentClass = AGENT_CLASS_MAP[log.agent] || 'planner'
          const isLong = log.message && log.message.length > MAX_SHORT_LENGTH
          const isExpanded = expandedLogs[i]
          const displayMessage = isLong && !isExpanded
            ? log.message.slice(0, MAX_SHORT_LENGTH) + '...'
            : log.message

          return (
            <div key={i} className="log-entry">
              <span className={`log-entry__agent log-entry__agent--${agentClass}`}>
                {log.agent}
              </span>
              <span className={`log-entry__type log-entry__type--${log.type}`}>
                [{log.type}]
              </span>
              <span className={`log-entry__message ${isExpanded ? 'log-entry__message--expanded' : ''}`}>
                {displayMessage}
              </span>
              {isLong && (
                <button
                  className="log-entry__toggle"
                  onClick={() => toggleExpand(i)}
                >
                  {isExpanded ? '▲ less' : '▼ more'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
