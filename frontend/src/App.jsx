import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
import MarketplaceCursos from './components/MarketplaceCursos';
import Finanzas from './components/Finanzas';
import Marketplace from './components/Marketplace';
import Cursos from './components/Cursos';
import Comunidad from './components/Comunidad';
import Oportunidades from './components/Oportunidades';
import { AuthPage } from './components/AuthPage';
import { Profile } from './components/Profile';
import SessionClosed from './components/SessionClosed';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'auth' o 'profile'
  const [authView, setAuthView] = useState('login'); // 'login', 'signup', 'forgot' o 'reset'
  const [resetToken, setResetToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset_token');
    if (token) {
      setAuthView('reset');
      setResetToken(token);
      setCurrentPage('auth');
      return;
    }

    if (isAuthenticated) {
      setCurrentPage('profile');
    }
  }, [isAuthenticated]);

  const navigateToAuth = (view = 'signup') => {
    if (isAuthenticated) {
      setCurrentPage('profile');
      return;
    }

    setAuthView(view);
    setCurrentPage('auth');
  };
  const navigateToLogin = () => navigateToAuth('login');
  const navigateToSignup = () => navigateToAuth('signup');
  const navigateToProfile = () => setCurrentPage('profile');
  const navigateHome = () => setCurrentPage('home');
  const handleLogoClick = () => {
    setCurrentPage('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentPage('closed');
  };

  const navigateToClosed = () => setCurrentPage('closed');

  const navigateToCursos = () => setCurrentPage('cursos');
  const navigateToMarketplace = () => setCurrentPage('marketplace');
  const navigateToComunidad = () => setCurrentPage('comunidad');
  const navigateToOportunidades = () => setCurrentPage('oportunidades');
  const navigateToFinanzas = () => setCurrentPage('finanzas');

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('profile');
  };

  if (currentPage === 'auth') {
    return (
      <AuthPage
        initialView={authView}
        resetToken={resetToken}
        onLoginSuccess={handleLoginSuccess}
        onResetSuccess={() => {
          setAuthView('login');
          setResetToken(null);
          window.history.replaceState({}, '', window.location.pathname);
        }}
        onCancel={navigateHome}
      />
    );
  }

  if (currentPage === 'profile') {
    return (
      <div>
        <Navbar
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onLogoClick={handleLogoClick}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(p) => {
            if (p === 'cursos') navigateToCursos();
            if (p === 'marketplace') navigateToMarketplace();
            if (p === 'comunidad') navigateToComunidad();
            if (p === 'finanzas') navigateToFinanzas();
            if (p === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Profile onLogout={handleLogout} />
      </div>
    );
  }

  if (currentPage === 'closed') {
    return (
      <div>
        {/* Navbar no se muestra al cerrar sesión */}
        <SessionClosed onReturnHome={navigateHome} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      {isAuthenticated && (
        <Navbar
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onLogoClick={handleLogoClick}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(p) => {
            if (p === 'cursos') navigateToCursos();
            if (p === 'marketplace') navigateToMarketplace();
            if (p === 'comunidad') navigateToComunidad();
            if (p === 'finanzas') navigateToFinanzas();
            if (p === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
      )}

      <main>
        {currentPage === 'home' && (
          <>
            <HeroSection onCreateAccountClick={navigateToSignup} />
            <FeaturesGrid />
          </>
        )}

        {currentPage === 'cursos' && <Cursos />}
        {currentPage === 'marketplace' && <Marketplace />}
        {currentPage === 'comunidad' && <Comunidad />}
        {currentPage === 'oportunidades' && <Oportunidades isAuthenticated={isAuthenticated} />}
        {currentPage === 'finanzas' && <Finanzas />}
      </main>
    </div>
  );
}

export default App;