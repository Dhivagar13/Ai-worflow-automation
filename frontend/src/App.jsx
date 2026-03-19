import { useState, useEffect } from 'react'

import './App.css'

import InputSection from './components/InputSection'
import WorkflowGraph from './components/WorkflowGraph'
import ThinkingIndicator from './components/ThinkingIndicator'
import PlanFlowchart from './components/PlanFlowchart'
import AgentTimeline from './components/AgentTimeline'
import DecisionPanel from './components/DecisionPanel'
import FinalOutput from './components/FinalOutput'
import AuthPage from './components/AuthPage'

import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, orderBy, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore'
import { auth, provider, db } from './firebase'

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
  
  // History State
  const [history, setHistory] = useState([])
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Auth state
  const [user, setUser] = useState(null)
  const [authInitializing, setAuthInitializing] = useState(true)

  // Listen for Auth and load Firestore history automatically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitializing(false);
      if (currentUser) {
        // Realtime subscription to the user's secure collections
        const q = query(collection(db, `users/${currentUser.uid}/history`), orderBy('timestamp', 'desc'));
        const unsubSnapshot = onSnapshot(q, (snapshot) => {
          const loadedHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHistory(loadedHistory);
        }, (err) => {
          console.error("Firestore sync error:", err);
        });
        return () => unsubSnapshot();
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, [])

  const handleLogout = async () => {
    await signOut(auth);
    setResult(null);
    setPipelineStage('idle');
  }

  const loadHistoryItem = (item) => {
    setResult(item.result)
    setError(null)
    setPipelineStage('complete')
  }

  const clearHistory = async () => {
    if (!user) {
      setHistory([]);
      return;
    }
    if (confirm("Are you sure you want to clear your synced history?")) {
      const q = query(collection(db, `users/${user.uid}/history`));
      const snaps = await getDocs(q);
      const deletePromises = snaps.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);
      setResult(null)
      setPipelineStage('idle')
    }
  }

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
      } else {
        // Save to Firestore History Securely
        if (user) {
          try {
            await addDoc(collection(db, `users/${user.uid}/history`), {
              task: task,
              date: new Date().toLocaleTimeString(),
              result: data,
              timestamp: Date.now()
            });
          } catch (e) { console.error("Could not save to firestore", e); }
        } else {
           // Fallback if not logged in
           setHistory(prev => [{ id: Date.now(), task, date: new Date().toLocaleTimeString(), result: data }, ...prev])
        }
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

  if (authInitializing) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Sidebar for History */}
      {isSidebarOpen && (
        <div className="sidebar panel">
          <div className="sidebar__header panel__header">
            <span>📚 Run History</span>
            <button className="sidebar__clear-btn" onClick={clearHistory}>Clear</button>
          </div>
          
            {/* Removed internal login button since AuthPage handles it */}
            <div className="sidebar__auth" style={{ padding: '0 16px 16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)' }}>
              <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)'}}>
                Agent <strong style={{color: 'var(--color-planner)'}}>{user.displayName || user.email?.split('@')[0]}</strong>
              </div>
              <button onClick={handleLogout} style={{background: 'rgba(255, 51, 51, 0.1)', border: '1px solid rgba(255, 51, 51, 0.3)', color: '#ff3333', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s'}}>Disconnect</button>
            </div>

          <div className="sidebar__body">
            {history.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '20px' }}>No history yet.</div>
            ) : (
              history.map(item => (
                <div key={item.id} className="history-item" onClick={() => loadHistoryItem(item)}>
                  <div className="history-item__task">{item.task}</div>
                  <div className="history-item__meta">
                    <span style={{ color: item.result.success ? 'var(--color-success)' : 'var(--color-error)' }}>
                      {item.result.success ? '✓ Success' : '❌ Failed'}
                    </span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="app">
        <button 
          className="sidebar-toggle" 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title="Toggle History Sidebar"
        >
           {isSidebarOpen ? '◀ Hide' : '▶ History'}
        </button>

        <div className="dashboard-layout">
          {/* Left Column: Input & Controls */}
          <div className="dashboard-left">
            <header className="header" style={{ textAlign: 'left', padding: '0 0 var(--space-xl) 0' }}>
              <div className="header__badge">
                <span className="header__badge-dot" />
                LangGraph Multi-Agent System
              </div>
              <h1 className="header__title" style={{ fontSize: '2rem' }}>AI Workflow Automation Engine</h1>
            </header>

            <InputSection onSubmit={handleSubmit} isLoading={isLoading} />

            {error && (
              <div style={{
                marginTop: '20px',
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
          </div>

          {/* Right Column: Dynamic Agent Dashboard */}
          <div className="dashboard-right">
            {(!result && !isLoading && pipelineStage === 'idle') ? (
               <div className="empty-state">
                 <div className="empty-state__icon">🤖</div>
                 <div className="empty-state__text">Agentic cluster is standing by...</div>
                 <div className="empty-state__subtext">Enter a command on the left to initialize planning and execution.</div>
               </div>
            ) : (
               <>
                 {/* Top: Visual Workflow Graph */}
                 <WorkflowGraph stage={pipelineStage} result={result} />
                 <ThinkingIndicator stage={pipelineStage} />

                 {isLoading && !result && (
                   <div className="loading-overlay" style={{ marginTop: '40px' }}>
                     <div className="loading-spinner" />
                     <div className="loading-text">
                       Agents are interacting...
                     </div>
                   </div>
                 )}

                 {/* Middle & Bottom: Results */}
                 {result && (
                   <div className="dashboard-results">
                     {/* Flowchart Diagram */}
                     <PlanFlowchart plan={result.plan} />

                     {/* Middle: Agent Timeline */}
                     <AgentTimeline logs={result.agent_logs} />
                     
                     {/* Components from previous view conditionally if needed, but primarily DecisionPanel */}
                     <DecisionPanel 
                        result={result} 
                        retryWorkflow={() => handleSubmit(result.task || "Improve previous output")}
                     />

                     {/* Bottom: Final Output */}
                     <FinalOutput result={result} />
                   </div>
                 )}
               </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

