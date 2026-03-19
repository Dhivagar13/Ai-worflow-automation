import React from 'react';
import './Navigation.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '💎' },
  { id: 'agents', label: 'Agents', icon: '🤖' },
  { id: 'execution', label: 'Execution', icon: '⚡' },
  { id: 'history', label: 'History', icon: '📚' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Navigation({ activeTab, setActiveTab, user, onLogout }) {
  return (
    <aside className="navigation">
      <div className="nav-logo">
        <div className="nav-logo__icon">AI</div>
        <div className="nav-logo__text">
          <span>Decision</span>
          <span className="accent">Intelligence</span>
        </div>
      </div>

      <nav className="nav-links">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-item__icon">{item.icon}</span>
            <span className="nav-item__label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="nav-footer">
        <div className="nav-user">
          <div className="nav-user__avatar">
            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
          </div>
          <div className="nav-user__info">
            <div className="nav-user__name">{user?.displayName || user?.email?.split('@')[0]}</div>
            <div className="nav-user__status">Online</div>
          </div>
        </div>
        <button className="nav-logout" onClick={onLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
