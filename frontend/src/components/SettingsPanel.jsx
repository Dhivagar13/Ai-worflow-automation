import React, { useState } from 'react';
import './SettingsPanel.css';

export default function SettingsPanel() {
  const [activeSegment, setActiveSegment] = useState('models');

  const [settings, setSettings] = useState({
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    maxTokens: 4096,
    verboseLogging: true,
    autoApproveReview: false,
    useMemory: true,
    theme: 'Dark Matrix',
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="tab-pane animate-fade">
      <h2 className="tab-title">System Configurations</h2>
      
      <div className="settings-layout">
        <div className="settings-sidebar glass">
          <button className={`settings-tab ${activeSegment === 'models' ? 'active' : ''}`} onClick={() => setActiveSegment('models')}>
            Neural Models
          </button>
          <button className={`settings-tab ${activeSegment === 'execution' ? 'active' : ''}`} onClick={() => setActiveSegment('execution')}>
            Execution Rules
          </button>
          <button className={`settings-tab ${activeSegment === 'interface' ? 'active' : ''}`} onClick={() => setActiveSegment('interface')}>
            Interface Preferences
          </button>
        </div>

        <div className="settings-content glass">
          {activeSegment === 'models' && (
            <div className="settings-group animate-slide-up">
              <h3 className="settings-header">Inference Engine Allocation</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Primary Language Model</label>
                  <span>Select the foundational intelligence layer.</span>
                </div>
                <select className="setting-select" value={settings.model} onChange={(e) => setSettings({...settings, model: e.target.value})}>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Groq Fast)</option>
                  <option value="gpt-4o">GPT-4o (OpenAI Premium)</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Temperature Threshold: {settings.temperature}</label>
                  <span>Higher values produce more creative variance.</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="1" step="0.1" 
                  value={settings.temperature} 
                  onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})} 
                  className="setting-slider" 
                />
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Persistent Memory Protocol</label>
                  <span>Retain contextual awareness across execution runs.</span>
                </div>
                <div className={`setting-toggle ${settings.useMemory ? 'active' : ''}`} onClick={() => handleToggle('useMemory')}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
          )}

          {activeSegment === 'execution' && (
            <div className="settings-group animate-slide-up">
              <h3 className="settings-header">Agentic Pipeline Rules</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Verbose Terminal Logging</label>
                  <span>Stream raw JSON execution states to the terminal UI.</span>
                </div>
                <div className={`setting-toggle ${settings.verboseLogging ? 'active' : ''}`} onClick={() => handleToggle('verboseLogging')}>
                  <div className="toggle-knob"></div>
                </div>
              </div>

              <div className="setting-item">
                <div className="setting-info">
                  <label>Monitor Auto-Approval</label>
                  <span style={{color: 'var(--color-warning)'}}>WARNING: Bypasses Reviewer Agent logic checks.</span>
                </div>
                <div className={`setting-toggle ${settings.autoApproveReview ? 'active' : ''}`} onClick={() => handleToggle('autoApproveReview')}>
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>
          )}

          {activeSegment === 'interface' && (
            <div className="settings-group animate-slide-up">
              <h3 className="settings-header">Holographic UI Customization</h3>
              
              <div className="setting-item">
                <div className="setting-info">
                  <label>Aesthetic Theme Layer</label>
                  <span>Adjust the global UI color matrix.</span>
                </div>
                <select className="setting-select" value={settings.theme} onChange={(e) => setSettings({...settings, theme: e.target.value})}>
                  <option value="Dark Matrix">Neon Green (System Default)</option>
                  <option value="Cyber Blue">Electric Blue (Protocol)</option>
                  <option value="Blood Red">Crimson (High Alert)</option>
                </select>
              </div>
            </div>
          )}

          <div className="settings-footer">
             <button className="settings-save-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Apply Parameters
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
