import { useState, useEffect } from 'react'
import './App.css'

// Existing Components
import InputSection from './components/InputSection'
import WorkflowGraph from './components/WorkflowGraph'
import PlanFlowchart from './components/PlanFlowchart'
import AgentTimeline from './components/AgentTimeline'
import FinalOutput from './components/FinalOutput'
import AuthPage from './components/AuthPage'

// New Platform Components
import Navigation from './components/Navigation'
import AgentControlPanel from './components/AgentControlPanel'
import LiveExecutionPanel from './components/LiveExecutionPanel'
import DecisionIntelligenceSystem from './components/DecisionIntelligenceSystem'
import AgentConversationPanel from './components/AgentConversationPanel'
import SettingsPanel from './components/SettingsPanel'

import { signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, addDoc, query, orderBy, onSnapshot, getDocs, deleteDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// v1.2.0 - CLOUD-FORCED GATEWAY
const API_BASE = import.meta.env.VITE_API_BASE_URL 
  || (window.location.hostname !== 'localhost'
      ? 'https://ai-worflow-automation.onrender.com' 
      : 'http://localhost:8000');

console.log('🚀 SYSTEM_v1.2.0_DEPLOYED | API_GATEWAY:', API_BASE);

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  const [pipelineStage, setPipelineStage] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  
  // Auth state
  const [user, setUser] = useState(null)
  const [authInitializing, setAuthInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthInitializing(false);
      if (currentUser) {
        const q = query(collection(db, `users/${currentUser.uid}/history`), orderBy('timestamp', 'desc'));
        const unsubSnapshot = onSnapshot(q, (snapshot) => {
          const loadedHistory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHistory(loadedHistory);
        }, (err) => console.error("Firestore sync error:", err));
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

  const handleSubmit = async (task) => {
    setIsLoading(true)
    setError(null)
    setResult(null)
    setPipelineStage('planner')
    setActiveTab('execution') // Auto-switch to execution view on run

    try {
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

      stageTimers.forEach(clearTimeout)
      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json()
      if (!data.success) {
        setError(data.error || 'Workflow failed.')
      } else if (user) {
        await addDoc(collection(db, `users/${user.uid}/history`), {
          task,
          date: new Date().toLocaleTimeString(),
          result: data,
          timestamp: Date.now()
        });
      }

      setResult(data)
      setPipelineStage('complete')
      setActiveTab('dashboard') // Switch back to dashboard to see results
    } catch (err) {
      setError(err.message)
      setPipelineStage('idle')
    } finally {
      setIsLoading(false)
    }
  }

  if (authInitializing) return <div className="loading-screen"><div className="loading-spinner"></div></div>;
  if (!user) return <AuthPage />;

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="tab-pane animate-fade">
             {!result && !isLoading ? (
               <div className="welcome-hero glass">
                  <h1>Welcome, Operator.</h1>
                  <p>Initialize a new AI strategy sequence to begin monitoring the Decision Intelligence System.</p>
                  <div className="hero-input-wrapper">
                    <InputSection onSubmit={handleSubmit} isLoading={isLoading} />
                  </div>
               </div>
             ) : (
               <div className="dashboard-grid">
                  <div className="grid-top">
                    <WorkflowGraph stage={pipelineStage} result={result} />
                  </div>
                  <div className="grid-mid">
                    <PlanFlowchart plan={result?.plan} />
                    <AgentControlPanel stage={pipelineStage} result={result} />
                  </div>
                  <div className="grid-bottom">
                     <DecisionIntelligenceSystem result={result} isRunning={isLoading} />
                     <FinalOutput result={result} />
                  </div>
               </div>
             )}
          </div>
        );
      case 'agents':
        return (
          <div className="tab-pane animate-fade">
            <h2 className="tab-title">Neural Agent Cluster</h2>
            <AgentControlPanel stage={pipelineStage} result={result} />
            <div className="agents-detail-view">
               <div className="glass agent-detail-card">
                  <h3>Agent Core Directives</h3>
                  <ul>
                    <li><strong>Planner:</strong> Optimization of multi-step logical branching.</li>
                    <li><strong>Executor:</strong> High-speed tool interaction and data harvesting.</li>
                    <li><strong>Reviewer:</strong> Critical validation and risk assessment protocols.</li>
                  </ul>
               </div>
            </div>
          </div>
        );
      case 'execution':
        return (
          <div className="tab-pane animate-fade">
            <h2 className="tab-title">Live Execution Pipeline</h2>
            <div className="execution-grid">
              <LiveExecutionPanel logs={result?.agent_logs || []} isRunning={isLoading} />
              <AgentConversationPanel logs={result?.agent_logs || []} />
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="tab-pane animate-fade">
            <h2 className="tab-title">Archived Operations</h2>
            <div className="history-grid">
              {history.map(item => (
                <div key={item.id} className="history-card glass" onClick={() => {setResult(item.result); setActiveTab('dashboard');}}>
                   <div className="history-card__task">{item.task}</div>
                   <div className="history-card__meta">
                      <span className={item.result.success ? 'success' : 'error'}>{item.result.success ? 'STABLE' : 'FAILED'}</span>
                      <span>{item.date}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return <SettingsPanel />;
      default:
        return <div className="tab-pane">Feature protocol pending...</div>;
    }
  }

  return (
    <>
    <div className="ambient-glow"></div>
    <div className="platform-container">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="main-viewport">
        <header className="viewport-header">
           <div className="header-breadcrumbs">System / {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
           <div className="header-status">
              <span className="pulse-dot"></span>
              CORE_ENGINE_ALIVE
           </div>
        </header>
        
        <div className="viewport-content">
          {renderContent()}
        </div>
      </main>

      {error && (
        <div className="system-error-toast" onClick={() => setError(null)}>
           <span className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
           </span>
           <div className="msg">
              <strong>CRITICAL_ERROR:</strong> {error}
           </div>
        </div>
      )}
    </div>
    </>
  )
}

export default App
