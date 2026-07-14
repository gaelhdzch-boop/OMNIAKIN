import { useEffect, useState, useRef } from 'react';
import { oportunidadesData } from '../data/oportunidadesData';
import { COLORS } from '../constants/colors';
import '../styles/Oportunidades.css';

const Oportunidades = ({ isAuthenticated }) => {
  const panelRef = useRef(null);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltrada, setCategoriaFiltrada] = useState('todas');
  const [estadoFiltrado, setEstadoFiltrado] = useState('todos');
  const [expandedOpportunityId, setExpandedOpportunityId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [postulaciones, setPostulaciones] = useState([]);

  useEffect(() => {
    const loadApplications = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('userApplications') || '[]');
        setPostulaciones(Array.isArray(stored) ? stored : []);
      } catch {
        setPostulaciones([]);
      }
    };

    loadApplications();
    window.addEventListener('opportunities:updated', loadApplications);
    return () => window.removeEventListener('opportunities:updated', loadApplications);
  }, []);

  const handleExplorarClick = () => {
    panelRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVerConvocatoria = (id) => {
    setExpandedOpportunityId((current) => (current === id ? null : id));
  };

  const handlePostularse = (item) => {
    const nuevaPostulacion = {
      id: item.id,
      titulo: item.titulo,
      organizacion: item.organizacion,
      estado: item.estado,
      estatus: item.estatus,
      fecha: new Date().toLocaleDateString('es-MX'),
    };

    const yaPostulada = postulaciones.some((app) => app.id === item.id);
    const actualizadas = yaPostulada
      ? postulaciones.map((app) => (app.id === item.id ? nuevaPostulacion : app))
      : [nuevaPostulacion, ...postulaciones];

    setPostulaciones(actualizadas);
    localStorage.setItem('userApplications', JSON.stringify(actualizadas));
    window.dispatchEvent(new Event('opportunities:updated'));
    setFeedbackMessage(`Te has postulado a ${item.titulo}`);
    setExpandedOpportunityId(item.id);

    if (!isAuthenticated) {
      setTimeout(() => setFeedbackMessage(''), 2500);
    }
  };

  const oportunidadesFiltradas = oportunidadesData.filter((item) => {
    const coincideTexto =
      item.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.organizacion.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(busqueda.toLowerCase());

    const coincideCategoria = categoriaFiltrada === 'todas' || item.categoria === categoriaFiltrada;
    const coincideEstado = estadoFiltrado === 'todos' || item.estado === estadoFiltrado;

    return coincideTexto && coincideCategoria && coincideEstado;
  });

  return (
    <>
      <section id="oportunidades" className="container py-5 mb-3">
        <div
          className="p-5 rounded-4 text-center shadow-sm"
          style={{ backgroundColor: COLORS.opportunitiesBg || '#e8f5e9' }}
        >
          <h2 className="fw-bold mb-3">Oportunidades para ti</h2>
          <p className="mx-auto mb-4" style={{ maxWidth: '700px' }}>
            Descubre empleos, becas, convocatorias de programas de gobierno, financiamiento y mentorías todo específicamente para mujeres emprendedoras.
          </p>
          <button
            className="btn bg-white rounded-pill px-4 py-2 fw-bold shadow-sm"
            style={{ color: '#000', border: 'none' }}
            onClick={handleExplorarClick}
          >
            Explorar oportunidades &rarr;
          </button>
        </div>
      </section>

      <div ref={panelRef} className="container py-5" style={{ scrollMarginTop: '90px' }}>
        <div className="text-center mb-5">
          <h3 className="fw-bold">Panel de Búsqueda</h3>
          <p className="text-muted">Filtra los mejores programas, becas y apoyos vigentes para mujeres emprendedoras.</p>
        </div>
        {feedbackMessage && (
          <div className="alert alert-success rounded-4 mb-4" role="status">
            {feedbackMessage}
          </div>
        )}
        <div className="row g-3 mb-5 bg-light p-4 rounded-4 shadow-sm">
          <div className="col-md-6">
            <input
              type="text"
              className="form-control rounded-pill px-4"
              placeholder="Buscar por palabra clave"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <select
              className="form-select rounded-pill px-3"
              value={categoriaFiltrada}
              onChange={(e) => setCategoriaFiltrada(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              <option value="apoyo-economico">Apoyos Económicos</option>
              <option value="becas">Becas</option>
              <option value="vivienda">Vivienda</option>
              <option value="empleos">Empleos</option>
            </select>
          </div>

          <div className="col-md-3">
            <select
              className="form-select rounded-pill px-3"
              value={estadoFiltrado}
              onChange={(e) => setEstadoFiltrado(e.target.value)}
            >
              <option value="todos">Todos los Estados</option>
              <option value="Nacional">Nacional</option>
              <option value="CDMX">CDMX</option>
              <option value="Edoméx">Edoméx</option>
              <option value="Puebla">Puebla</option>
              <option value="Querétaro">Querétaro</option>
              <option value="Hidalgo">Hidalgo</option>
            </select>
          </div>
        </div>

        {oportunidadesFiltradas.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <h4>No se encontraron oportunidades</h4>
            <p>Intenta cambiando los términos de búsqueda o los filtros.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {oportunidadesFiltradas.map((item) => {
              const yaPostulada = postulaciones.some((app) => app.id === item.id);
              const estaExpandida = expandedOpportunityId === item.id;

              return (
              <div className="col" key={item.id}>
                <div className="card h-100 shadow-sm rounded-4 p-3 oportunidad-card">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <span className="badge rounded-pill badge-categoria px-3 py-2 text-capitalize">
                      {item.categoria.replace('-', ' ')}
                    </span>
                    <span className={`badge rounded-pill px-3 py-2 ${
                      item.estatus === 'Abierta' ? 'badge-abierta' :
                      item.estatus === 'Próxima' ? 'badge-proxima' : 'badge-cerrada'
                    }`}>
                      {item.estatus}
                    </span>
                  </div>

                  <div className="card-body p-0 mb-3">
                    <small className="text-muted fw-bold text-uppercase d-block mb-1" style={{ letterSpacing: '0.5px', fontSize: '0.75rem' }}>
                      {item.organizacion}
                    </small>
                    <h5 className="card-title fw-bold mb-3 text-dark" style={{ lineHeight: '1.3' }}>
                      {item.titulo}
                    </h5>
                    <p className="card-text text-muted small mb-3" style={{ minHeight: '45px' }}>
                      {item.descripcion}
                    </p>

                    <div className="bg-light p-3 rounded-3 mb-3 border-0">
                      <div className="small mb-2 text-dark"><strong>📍 Ubicación:</strong> {item.estado}</div>
                      <div className="small text-dark"><strong>💰 Beneficio:</strong> {item.monto}</div>
                    </div>

                    <div className="small">
                      <strong className="text-dark d-block mb-2">Requisitos clave:</strong>
                      <ul className="ps-3 mb-0 requisitos-list">
                        {item.requisitos.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {estaExpandida && (
                    <div className="mt-3 rounded-3 border bg-light p-3">
                      <h6 className="fw-bold mb-2">Detalles de la convocatoria</h6>
                      <p className="small text-muted mb-2">{item.descripcion}</p>
                      <ul className="ps-3 mb-0 requisitos-list">
                        {item.requisitos.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="card-footer bg-transparent border-0 p-0 d-flex gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => handleVerConvocatoria(item.id)}
                      className="btn btn-outline-secondary btn-sm rounded-pill flex-grow-1 py-2 fw-semibold"
                    >
                      {estaExpandida ? 'Ocultar detalles' : 'Ver convocatoria'}
                    </button>
                    <button
                      onClick={() => handlePostularse(item)}
                      className="btn btn-sm rounded-pill flex-grow-1 py-2 fw-semibold text-white btn-postular"
                      style={{ backgroundColor: COLORS.primary || '#e91e63' }}
                      disabled={yaPostulada}
                    >
                      {yaPostulada ? 'Postulado' : 'Postularse'}
                    </button>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Oportunidades;
