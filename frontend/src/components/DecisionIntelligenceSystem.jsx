import React from 'react';
import './DecisionIntelligenceSystem.css';

export default function DecisionIntelligenceSystem({ result, isRunning }) {
  if (!result && !isRunning) return null;

  const confidence = result?.monitor_feedback?.includes('approved') ? 98 : isRunning ? 45 : 0;
  const risk = result?.monitor_decision?.includes('FAIL') ? 'HIGH' : result ? 'LOW' : 'ASSESSING...';
  const riskColor = risk === 'HIGH' ? 'var(--color-error)' : risk === 'LOW' ? 'var(--color-executor)' : 'var(--color-warning)';

  return (
    <div className="decision-intelligence-system glass animate-slide-up">
      <div className="di-header">
         <span className="di-label">Decision Intelligence Intelligence Engine v2</span>
         <span className="di-status-badge">PROTECTED</span>
      </div>

      <div className="di-body grid-3">
         {/* Confidence Score */}
         <div className="di-metric">
            <div className="di-metric__header">
               <span className="label">Confidence Score</span>
               <span className="value" style={{ color: 'var(--color-executor)' }}>{confidence}%</span>
            </div>
            <div className="di-metric__bar-bg">
               <div className="di-metric__bar" style={{ width: `${confidence}%`, background: 'var(--gradient-executor)' }}>
                  <div className="di-metric__glow"></div>
               </div>
            </div>
            <p className="di-metric__description">AI assurance for strategic path alignment.</p>
         </div>

         {/* Risk Analysis */}
         <div className="di-metric">
            <div className="di-metric__header">
               <span className="label">Risk Profile</span>
               <span className="value" style={{ color: riskColor }}>{risk}</span>
            </div>
            <div className="risk-indicator">
               <div className={`indicator-step ${risk === 'LOW' ? 'active green' : ''}`}></div>
               <div className={`indicator-step ${risk === 'MEDIUM' ? 'active yellow' : ''}`}></div>
               <div className={`indicator-step ${risk === 'HIGH' ? 'active red' : ''}`}></div>
            </div>
            <p className="di-metric__description">Real-time threat and logic validation.</p>
         </div>

         {/* Strategic Recommendation */}
         <div className="di-metric recommendation">
            <div className="di-metric__header">
               <span className="label">Final Decision</span>
            </div>
            <div className="recommendation-content">
               {isRunning ? (
                 <div className="loading-dots">Assessing data streams<span>.</span><span>.</span><span>.</span></div>
               ) : (
                 <div className="decision-text">
                    <span className="decision-icon">{result?.success ? '✅' : '🔴'}</span>
                    <span>{result?.monitor_decision || 'NEUTRAL_PATH'}</span>
                 </div>
               )}
            </div>
            <p className="di-metric__description">Outcome verified by Reviewer Agent.</p>
         </div>
      </div>

      <div className="di-footer">
         <div className="alternative-options">
            <span className="label">Alternative Options Evaluated:</span>
            <div className="options-list">
               <span className="option-tag">Branch A (Dismissed)</span>
               <span className="option-tag">Branch B (Current)</span>
               <span className="option-tag">Branch C (Pending)</span>
            </div>
         </div>
      </div>
    </div>
  );
}
