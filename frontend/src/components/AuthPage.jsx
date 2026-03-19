import React, { useState } from 'react';
import { 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, provider, db } from '../firebase';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Securely register the user in Firestore database upon first login/signup
  const syncUserToFirestore = async (user) => {
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || '',
        authProvider: user.providerData[0]?.providerId || 'password',
        createdAt: new Date().toISOString()
      }, { merge: true });
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      await syncUserToFirestore(result.user);
    } catch (e) {
      setError(e.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(result.user);
      }
    } catch (e) {
      setError(e.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-header__badge">
            <span className="auth-header__dot"></span>
            Agentic Engine Authorization
          </div>
          <h1>{isLogin ? 'Access Dashboard' : 'Initialize Account'}</h1>
          <p>Sign in to configure AI routines and monitor your execution pipelines.</p>
        </div>

        {error && <div className="auth-error">❌ {error}</div>}

        <form className="auth-form" onSubmit={handleEmailAuth}>
          <div className="auth-form__group">
            <label>Secure Email</label>
            <input 
              type="email" 
              placeholder="operator@workflow.ai" 
              value={email}
              autoComplete="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="auth-form__group">
            <label>Access Credential</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
            {loading ? 'Authenticating...' : (isLogin ? 'Execute Login' : 'Create Account')}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button 
          className="auth-btn auth-btn--google" 
          onClick={handleGoogleAuth} 
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
          Authenticate with Google
        </button>

        <div className="auth-footer">
          {isLogin ? "Don't have clearance? " : "Already initialized? "}
          <button 
            type="button" 
            className="auth-toggle-btn" 
            onClick={() => { setIsLogin(!isLogin); setError(null); }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
}
