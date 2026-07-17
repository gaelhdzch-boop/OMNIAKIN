import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { FeaturesGrid } from './components/FeaturesGrid';
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
  const [resetToken] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('reset_token');
  });
  const [authView, setAuthView] = useState(() => (resetToken ? 'reset' : 'login'));
  const [currentPage, setCurrentPage] = useState(() => {
    if (resetToken) return 'auth';
    if (localStorage.getItem('token')) return 'profile';
    return 'home';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

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
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <AuthPage
          key={`${authView}-${resetToken || ''}`}
          initialView={authView}
          resetToken={resetToken}
          onLoginSuccess={handleLoginSuccess}
          onResetSuccess={() => {
            setAuthView('login');
            window.history.replaceState({}, '', window.location.pathname);
          }}
          onCancel={navigateHome}
        />
      </div>
    );
  }

  if (currentPage === 'profile') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Profile onLogout={handleLogout} />
      </div>
    );
  }

  if (currentPage === 'cursos') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Cursos />
      </div>
    );
  }

  if (currentPage === 'marketplace') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Marketplace />
      </div>
    );
  }

  if (currentPage === 'comunidad') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Comunidad />
      </div>
    );
  }

  if (currentPage === 'finanzas') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Finanzas />
      </div>
    );
  }

  if (currentPage === 'oportunidades') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          onNavigate={(page) => {
            if (page === 'cursos') navigateToCursos();
            else if (page === 'marketplace') navigateToMarketplace();
            else if (page === 'comunidad') navigateToComunidad();
            else if (page === 'finanzas') navigateToFinanzas();
            else if (page === 'oportunidades') navigateToOportunidades();
          }}
          onLogout={handleLogout}
        />
        <Oportunidades isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <main>
        {currentPage === 'home' && (
          <>
            <HeroSection onCreateAccountClick={navigateToSignup} onLoginClick={navigateToLogin} />
            <FeaturesGrid />
          </>
        )}
      </main>
    </div>
  );
}

export default App;