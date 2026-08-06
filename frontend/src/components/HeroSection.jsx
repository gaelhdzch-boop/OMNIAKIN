import { useEffect, useRef } from 'react';
import { COLORS } from '../constants/colors';
import '../styles/Auth.css';

export const HeroSection = ({ onLogoClick, onCreateAccountClick, onLoginClick }) => {
  const sectionRef = useRef(null);
  const featureItems = [
    {
      title: 'Aprende con confianza',
      text: 'Cursos prácticos y contenidos pensados para impulsar tu negocio desde la primera clase.',
    },
    {
      title: 'Vende con apoyo',
      text: 'Publica tus productos y llega a más clientas dentro de nuestra red de emprendedoras.',
    },
    {
      title: 'Recibe financiamiento',
      text: 'Accede a oportunidades, becas y apoyos diseñados para crecer la capacidad de tu proyecto.',
    },
    {
      title: 'Conecta comunidad',
      text: 'Comparte avances, recibe mentoría y construye alianzas con otras mujeres líderes.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Conecta con recursos',
      description: 'Encuentra plantillas, herramientas y rutas de aprendizaje para tu crecimiento.',
    },
    {
      step: '02',
      title: 'Impulsa tus ventas',
      description: 'Comparte tus productos en un marketplace especializado en proyectos femeninos.',
    },
    {
      step: '03',
      title: 'Accede a apoyo real',
      description: 'Descubre programas y apoyos financieros para escalar tu negocio.',
    },
  ];

  const allInOneItems = [
    {
      title: 'Cursos claros y prácticos',
      text: 'Aprovecha rutas de aprendizaje con ejercicios reales y resultados medibles.',
    },
    {
      title: 'Marketplace especializado',
      text: 'Muestra tus productos a clientas que buscan apoyar a negocios femeninos.',
    },
    {
      title: 'Apoyos financieros',
      text: 'Encuentra becas, financiamientos y programas de apoyo hechos para ti.',
    },
    {
      title: 'Comunidad cercana',
      text: 'Comparte avances, recibe retroalimentación y crece junto a otras emprendedoras.',
    },
  ];

  const discoveries = [
    {
      title: 'Formación a tu ritmo',
      description: 'Aprende con cursos diseñados para mujeres emprendedoras, desde lo básico hasta lo avanzado.',
    },
    {
      title: 'Impulso para tus ventas',
      description: 'Publica tu oferta y conéctate con clientas reales que buscan emprendedoras como tú.',
    },
    {
      title: 'Oportunidades reales',
      description: 'Accede a becas, apoyos y convocatorias pensadas para tu crecimiento.',
    },
  ];

  useEffect(() => {
    if (!sectionRef.current) return;
    const items = sectionRef.current.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="inicio" className="hero-section pt-4 pb-5 position-relative">
      <div className="container pt-2 pb-4" ref={sectionRef}>
        <header className="auth-page-navbar reveal delay-0">
          <button className="auth-brand" type="button" onClick={onLogoClick}>
            <img src="/logo.ico" alt="OMNIA KIN logo" className="auth-brand-logo" />
            <span>OMNIA KIN</span>
          </button>
          <div className="auth-page-actions">
            <button
              type="button"
              className="btn btn-link"
              onClick={onLoginClick}
            >
              Entrar
            </button>
            <button
              type="button"
              className="btn rounded-pill btn-primary"
              onClick={onCreateAccountClick}
            >
              Crear cuenta
            </button>
          </div>
        </header>
        <div className="row justify-content-center reveal delay-1">
          <div className="col-xl-8 col-lg-10 text-center">
            <h1 className="hero-main-title fw-bold mb-3">
              Crece a tu propio ritmo
            </h1>
            <h2 className="hero-subtitle fw-normal mb-4">
              con tu propia red.
            </h2>
            <p className="lead mx-auto mb-4 fw-bold reveal delay-2 hero-copy">
              Tu talento, nuestras herramientas. Encuentra formación, marketplace y respaldo financiero para tu negocio en un solo lugar.
              Un espacio diseñado para mujeres emprendedoras que quieren avanzar con seguridad, comunidad y resultados reales.
            </p>
            <div className="hero-pill-group reveal delay-2">
              <span className="hero-pill">Formación práctica</span>
              <span className="hero-pill">Ventas con visibilidad</span>
              <span className="hero-pill">Apoyo financiero</span>
              <span className="hero-pill">Red de emprendedoras</span>
            </div>

            <div className="row gx-3 justify-content-center mt-4 reveal delay-3 hero-metrics-row">
              <div className="col-md-4">
                <div className="p-3 rounded-4 hero-metric-card text-center">
                  <div className="display-6 fw-bold text-gradient">200+</div>
                  <p className="mb-0 text-uppercase fw-semibold" style={{ color: COLORS.primary, letterSpacing: '0.12em' }}>
                    emprendimientos ya en marcha
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-4 hero-metric-card text-center">
                  <div className="display-6 fw-bold text-gradient">80%</div>
                  <p className="mb-0 text-uppercase fw-semibold" style={{ color: COLORS.primary, letterSpacing: '0.12em' }}>
                    satisfacción de nuestras usuarias
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="p-3 rounded-4 hero-metric-card text-center">
                  <div className="display-6 fw-bold text-gradient">3</div>
                  <p className="mb-0 text-uppercase fw-semibold" style={{ color: COLORS.primary, letterSpacing: '0.12em' }}>
                    áreas juntas en un solo espacio
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-xl-10">
            <div className="p-4 rounded-4 shadow-sm mb-5 hero-all-in-one-card reveal delay-4">
              <div className="row g-4 align-items-center">
                <div className="col-lg-5">
                  <span className="text-uppercase fw-semibold" style={{ color: COLORS.primary, letterSpacing: '0.12em' }}>
                    Todo lo que necesitas, junto
                  </span>
                  <h3 className="fw-bold mt-3" style={{ color: COLORS.darkPrimary }}>
                    Formación, ventas y apoyo financiero en un solo lugar
                  </h3>
                  <p style={{ color: COLORS.mediumPrimary }}>
                    Todo lo que necesitas para avanzar con confianza: cursos prácticos, marketplace para tus productos y redes de apoyo financiero diseñadas para tu negocio.
                  </p>
                  <ul className="hero-all-in-one-list mb-0" style={{ color: COLORS.mediumPrimary }}>
                    <li>• Aprende con rutas claras y contenido fácil de aplicar.</li>
                    <li>• Publica tus ofertas para conectar con clientas reales.</li>
                    <li>• Accede a convocatorias, microcréditos y apoyos estratégicos.</li>
                  </ul>
                </div>
                <div className="col-lg-7">
                  <div className="row g-3">
                    {allInOneItems.map((item) => (
                      <div key={item.title} className="col-sm-6">
                        <div className="p-3 rounded-4 hero-all-in-one-item h-100">
                          <h5 className="mb-2 fw-bold" style={{ color: COLORS.primary }}>{item.title}</h5>
                          <p className="mb-0" style={{ color: COLORS.darkPrimary }}>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 hero-feature-cards">
          {featureItems.map((item, index) => (
            <div key={item.title} className="col-md-6 col-lg-3 reveal delay-4">
              <div className="p-4 rounded-4 shadow-sm h-100 hero-feature-card">
                <h5 className="fw-bold mb-2" style={{ color: COLORS.primary }}>{item.title}</h5>
                <p className="mb-0" style={{ color: COLORS.darkPrimary }}>{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="row gy-4 mt-5 reveal delay-5">
          <div className="col-lg-6">
            <div className="p-4 rounded-4 shadow-sm h-100 hero-welcome-card">
              <h3 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Bienvenida a tu espacio de crecimiento</h3>
              <p style={{ color: COLORS.darkPrimary }}>
                Este sitio es tu punto de partida para transformar ideas en ingresos. Aquí puedes aprender nuevas habilidades, presentar tus productos y descubrir apoyos que te permitan avanzar sin perder tu esencia.
              </p>
              <ul className="list-unstyled mb-0" style={{ color: COLORS.mediumPrimary }}>
                <li className="mb-2">• Formación adaptada a tu ritmo y a tus necesidades.</li>
                <li className="mb-2">• Marketplace para visibilizar tu emprendimiento.</li>
                <li className="mb-2">• Oportunidades financieras diseñadas para mujeres emprendedoras.</li>
              </ul>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="p-4 rounded-4 shadow-sm h-100 hero-support-card reveal delay-5">
              <h3 className="fw-bold mb-3" style={{ color: COLORS.primary }}>Así te apoyamos</h3>
              <div className="d-flex flex-column gap-3 mt-3">
                {steps.map((item) => (
                  <div key={item.step} className="p-3 rounded-4 hero-step-card">
                    <div className="d-flex align-items-start gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center step-bubble">
                        {item.step}
                      </div>
                      <div>
                        <h5 className="mb-1 fw-bold" style={{ color: COLORS.darkPrimary }}>{item.title}</h5>
                        <p className="mb-0" style={{ color: COLORS.mediumPrimary }}>{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row gy-4 mt-5">
          <div className="col-12 text-center">
            <h3 className="fw-bold" style={{ color: COLORS.primary }}>Qué encontrarás aquí</h3>
            <p className="mx-auto" style={{ maxWidth: '720px', color: COLORS.mediumPrimary }}>
              Un camino con herramientas claras, apoyo entre emprendedoras y oportunidades para que tu negocio crezca con sentido.
            </p>
          </div>
          {discoveries.map((item, index) => (
            <div key={item.title} className="col-md-4 reveal delay-6">
              <div className="p-4 rounded-4 shadow-sm h-100 hero-discovery-card">
                <h5 className="fw-bold mb-2" style={{ color: COLORS.darkPrimary }}>{item.title}</h5>
                <p className="mb-0" style={{ color: COLORS.mediumPrimary }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
