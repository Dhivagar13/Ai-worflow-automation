import React, { useState } from 'react';
import './DecisionPanel.css';

export default function DecisionPanel({ result, retryWorkflow }) {
  const [showExplanation, setShowExplanation] = useState(false);

  if (!result || !result.execution_results) return null;

  const executionResults = result.execution_results;
  
  // Calculate a mock confidence score based on error/retry presence to simulate an intelligent dashboard
  const totalItems = executionResults.execution_summary?.length || 1;
  const retryPenalty = (result.retry_count || 0) * 15;
  const issues = executionResults.execution_summary?.filter(s => s.issues).length || 0;
  
  let confidence = 98 - retryPenalty - (issues * 10);
  if (confidence < 20) confidence = 20;
  if (result.monitor_decision === 'rejected') confidence -= 30;

  let risk = "Low";
  let riskClass = "low";
  if (confidence < 80) { risk = "Medium"; riskClass = "medium"; }
  if (confidence < 50) { risk = "High"; riskClass = "high"; }

  // Extract tools used across all steps for "Tool Simulation" badges
  const toolsUsed = new Set();
  if (result.tool_selections?.tool_selections) {
    result.tool_selections.tool_selections.forEach(sel => {
      if (sel.selected_tools) {
         sel.selected_tools.forEach(t => toolsUsed.add(t.tool_name));
      }
    });
  }
  const toolsList = Array.from(toolsUsed);

  return (
    <div className="decision-panel">
      <div className="decision-panel__header">
        <span className="icon">⚖️</span>
        <span>Decision Intelligence</span>
      </div>
      
      <div className="decision-panel__body">
        
        {/* Metric Cards */}
        <div className="decision-metrics">
          <div className="decision-metric">
            <span className="decision-metric__label">Confidence Score</span>
            <div className="decision-metric__value-row">
              <span className="decision-metric__value">{confidence}%</span>
              <div className="decision-metric__bar-wrapper">
                <div 
                  className="decision-metric__bar" 
                  style={{ 
                    width: `${confidence}%`, 
                    background: riskClass === 'low' ? 'var(--color-success)' : riskClass === 'medium' ? 'var(--color-warning)' : 'var(--color-error)' 
                  }}
                />
              </div>
            </div>
          </div>
          <div className="decision-metric">
            <span className="decision-metric__label">Risk Level</span>
            <span className={`decision-metric__badge risk--${riskClass}`}>{risk} Risk</span>
          </div>
        </div>

        {/* Tools Simulation / Usage */}
        {toolsList.length > 0 && (
          <div className="decision-tools">
            <div className="decision-tools__label">Simulated Tools Utilized:</div>
            <div className="decision-tools__badges">
              {toolsList.map(t => (
                <span key={t} className="decision-tool__badge">{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="decision-actions">
           <button 
             className="decision-btn decision-btn--explain" 
             onClick={() => setShowExplanation(!showExplanation)}
           >
             {showExplanation ? "Hide Reasoning" : "Explain Decision"}
           </button>
           
           <button 
             className="decision-btn decision-btn--retry" 
             onClick={retryWorkflow}
           >
             ⚡ Request AI Improvement
           </button>
        </div>

        {/* Reusable Explanation block */}
        {showExplanation && (
           <div className="decision-explanation">
             <div className="decision-explanation__section">
               <strong>Reviewer Feedback:</strong>
               <p>{result.monitor_feedback || "No profound feedback provided. Task execution met parameters."}</p>
             </div>
             <div className="decision-explanation__section">
               <strong>Execution Summary:</strong>
               <p>{executionResults.overall_summary}</p>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}
