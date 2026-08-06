import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import Finanzas from './components/Finanzas';
import Marketplace from './components/Marketplace';
import Cursos from './components/Cursos';
import CursoDetalle from './components/CursoDetalle';
import Comunidad from './components/Comunidad';
import Oportunidades from './components/Oportunidades';
import AdminDashboard from './components/AdminDashboard';
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
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [selectedCourse, setSelectedCourse] = useState(null);

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
    setUser(null);
    setCurrentPage('closed');
  };

  const navigateToCursos = () => setCurrentPage('cursos');
  const navigateToMarketplace = () => setCurrentPage('marketplace');
  const navigateToComunidad = () => setCurrentPage('comunidad');
  const navigateToOportunidades = () => setCurrentPage('oportunidades');
  const navigateToFinanzas = () => setCurrentPage('finanzas');
  const navigateToAdmin = () => setCurrentPage('admin');

  const handleNavigation = (page) => {
    if (page === 'cursos') navigateToCursos();
    else if (page === 'marketplace') navigateToMarketplace();
    else if (page === 'comunidad') navigateToComunidad();
    else if (page === 'finanzas') navigateToFinanzas();
    else if (page === 'oportunidades') navigateToOportunidades();
    else if (page === 'admin') navigateToAdmin();
  };

  const navigateToCourseDetail = (course) => {
    setSelectedCourse(course);
    setCurrentPage('curso-detail');
  };

  const navigateBackToCursos = () => {
    setCurrentPage('cursos');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUser(() => {
      try {
        return JSON.parse(localStorage.getItem('user')) || null;
      } catch {
        return null;
      }
    });
    setCurrentPage('profile');
  };

  if (currentPage === 'auth') {
    return (
      <div>
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
          userRole={user?.rol}
          onNavigate={handleNavigation}
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
          userRole={user?.rol}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
        <Cursos onViewCourseDetail={navigateToCourseDetail} />
      </div>
    );
  }

  if (currentPage === 'curso-detail') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          userRole={user?.rol}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
        <CursoDetalle curso={selectedCourse} onBack={navigateBackToCursos} />
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
          userRole={user?.rol}
          onNavigate={handleNavigation}
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
          userRole={user?.rol}
          onNavigate={handleNavigation}
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
          userRole={user?.rol}
          onNavigate={handleNavigation}
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
          userRole={user?.rol}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
        <Oportunidades isAuthenticated={isAuthenticated} />
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div>
        <Navbar 
          onLogoClick={handleLogoClick}
          onCreateAccountClick={navigateToSignup}
          onLoginClick={navigateToLogin}
          onProfileClick={navigateToProfile}
          isAuthenticated={isAuthenticated}
          userRole={user?.rol}
          onNavigate={handleNavigation}
          onLogout={handleLogout}
        />
        <AdminDashboard />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      <main>
        {currentPage === 'home' && (
          <>
            <HeroSection
              onLogoClick={handleLogoClick}
              onCreateAccountClick={navigateToSignup}
              onLoginClick={navigateToLogin}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;