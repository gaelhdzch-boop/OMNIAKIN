import { useState } from 'react';
import { SignUp } from './SignUp';
import { Login } from './Login';
import { ForgotPassword } from './ForgotPassword';
import { ResetPassword } from './ResetPassword';

export const AuthPage = ({ initialView = 'login', resetToken = null, onLoginSuccess, onResetSuccess, onCancel }) => {
  const [currentView, setCurrentView] = useState(resetToken ? 'reset' : initialView); // 'login', 'signup', 'forgot' o 'reset'

  return (
    <div className="auth-page">
      <header className="auth-page-navbar">
        <button className="auth-brand" type="button" onClick={onCancel}>
          <img src="/logo.ico" alt="OMNIA KIN logo" className="auth-brand-logo" />
          <span>OMNIA KIN</span>
        </button>
        <div className="auth-page-actions">
          <button
            type="button"
            className={`btn btn-link ${currentView === 'login' ? 'active' : ''}`}
            onClick={() => setCurrentView('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`btn rounded-pill ${currentView === 'signup' ? 'btn-primary' : 'btn-outline-primary'}`}
            style={currentView === 'signup' ? {} : { color: '#d63384', borderColor: '#d63384' }}
            onClick={() => setCurrentView('signup')}
          >
            Crear cuenta
          </button>
        </div>
      </header>

      {currentView === 'signup' ? (
        <SignUp onSwitchToLogin={() => setCurrentView('login')} onCancel={onCancel} />
      ) : currentView === 'forgot' ? (
        <ForgotPassword onSwitchToLogin={() => setCurrentView('login')} onCancel={onCancel} />
      ) : currentView === 'reset' ? (
        <ResetPassword token={resetToken} onResetSuccess={onResetSuccess} onSwitchToLogin={() => setCurrentView('login')} onCancel={onCancel} />
      ) : (
        <Login
          onSwitchToSignUp={() => setCurrentView('signup')}
          onRecoverPassword={() => setCurrentView('forgot')}
          onLoginSuccess={onLoginSuccess}
          onCancel={onCancel}
        />
      )}
    </div>
  );
};
