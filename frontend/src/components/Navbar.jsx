import { COLORS } from '../constants/colors';

export const Navbar = ({ onCreateAccountClick, onLoginClick, onLogoClick, onProfileClick, isAuthenticated, onNavigate, onLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container">
          <button className="navbar-brand fw-bold btn btn-link p-0 d-flex align-items-center gap-2" type="button" onClick={onLogoClick}>
            <img src="/logo.ico" alt="OMNIA KIN logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <span className="fw-bold">OMNIA KIN</span>
          </button>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {isAuthenticated && (
            <ul className="navbar-nav mx-auto">
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => onNavigate?.('cursos')}>Cursos</button></li>
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => onNavigate?.('marketplace')}>Marketplace</button></li>
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => onNavigate?.('comunidad')}>Comunidad</button></li>
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => onNavigate?.('finanzas')}>Finanzas</button></li>
              <li className="nav-item"><button className="nav-link btn btn-link" onClick={() => onNavigate?.('oportunidades')}>Oportunidades</button></li>
            </ul>
          )}

          <div className="d-flex gap-2">
            {isAuthenticated ? (
              <>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={onProfileClick}
                >
                  Perfil
                </button>
                <button 
                  className="btn btn-link text-dark text-decoration-none"
                  onClick={onLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <button 
                  className="btn btn-link text-dark text-decoration-none"
                  onClick={onLoginClick}
                >
                  Entrar
                </button>
                <button 
                  className="btn rounded-pill text-white"
                  style={{ backgroundColor: COLORS.primary, border: 'none' }}
                  onClick={onCreateAccountClick}
                >
                  Crear cuenta
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
