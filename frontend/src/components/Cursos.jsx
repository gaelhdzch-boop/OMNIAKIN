import { Fragment, useEffect, useMemo, useState } from 'react';
import { COLORS } from '../constants/colors';
import { authService, publicService } from '../services/api';
import '../styles/Cursos.css';

export default function Cursos({ onViewCourseDetail }) {
  const [cursosBase, setCursosBase] = useState([]);
  const [categoria, setCategoria] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [progresoCursos, setProgresoCursos] = useState({});
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cursosLoading, setCursosLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarCursosPublicos = async () => {
      try {
        setCursosLoading(true);
        const data = await publicService.listCourses();
        const cursos = data.courses || [];
        setCursosBase(cursos);
        if (cursos.length > 0) {
          setCursoSeleccionado(cursos[0]);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'No se pudieron cargar los cursos');
      } finally {
        setCursosLoading(false);
      }
    };

    cargarCursosPublicos();
  }, []);

  useEffect(() => {
    const cargarProgreso = async () => {
      if (!localStorage.getItem('token')) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getUserCourses();
        const mapa = {};
        (data.courses || []).forEach((curso) => {
          mapa[curso.curso_id] = Number(curso.progreso || 0);
        });
        setProgresoCursos(mapa);
      } catch (err) {
        setError(err.message || 'No se pudo cargar tu progreso');
      } finally {
        setLoading(false);
      }
    };

    cargarProgreso();
  }, []);

  useEffect(() => {
    if (!cursoSeleccionado && cursosBase.length > 0) {
      setCursoSeleccionado(cursosBase[0]);
    }
  }, [cursosBase, cursoSeleccionado]);

  const cursosFiltrados = useMemo(() => {
    return cursosBase.filter((curso) => {
      const porCat = categoria === 'Todos' || curso.categoria === categoria;
      const porBusq = !busqueda || curso.titulo.toLowerCase().includes(busqueda.toLowerCase());
      return porCat && porBusq;
    });
  }, [categoria, busqueda, cursosBase]);

  const guardarInscripcion = async (curso, siguienteProgreso) => {
    if (!localStorage.getItem('token')) {
      setError('Inicia sesión para guardar tu inscripción y progreso.');
      return;
    }

    try {
      const progresoActual = Number(progresoCursos[curso.id] || 0);
      const progreso = Math.max(progresoActual, siguienteProgreso);

      if (progresoActual > 0) {
        await authService.updateCourseProgress(curso.id, progreso);
      } else {
        await authService.registerCourse(curso.id, progreso);
      }

      setProgresoCursos((prev) => ({ ...prev, [curso.id]: progreso }));
      setCursoSeleccionado(curso);
      setMessage(`Tu avance en "${curso.titulo}" se guardó en ${progreso}%.`);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudo guardar el curso');
    }
  };

  const inscribirse = async (curso) => {
    await guardarInscripcion(curso, 10);
  };

  const avanzarCurso = async (curso) => {
    const progresoActual = Number(progresoCursos[curso.id] || 0);
    const siguiente = Math.min(100, progresoActual + 25);
    await guardarInscripcion(curso, siguiente);
  };

  const reiniciarCurso = async (curso) => {
    if (!localStorage.getItem('token')) {
      setError('Inicia sesión para reiniciar tu progreso.');
      return;
    }

    try {
      await authService.updateCourseProgress(curso.id, 0);
      setProgresoCursos((prev) => ({ ...prev, [curso.id]: 0 }));
      setCursoSeleccionado(curso);
      setMessage(`Reiniciaste el avance de "${curso.titulo}".`);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudo reiniciar el curso');
    }
  };

  return (
    <section id="cursos" className="cursos-page p-5">
      <div className="container">
        <div className="section-header cursos-header mb-4">
          <h2 className="section-title">Cursos</h2>
          <p className="section-copy">Formación práctica para crecer tu negocio.</p>
        </div>

        <div className="d-flex gap-3 mb-4 flex-wrap">
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="form-select w-auto">
            <option>Todos</option>
            <option>Emprendimiento</option>
            <option>Digital</option>
            <option>Finanzas</option>
          </select>
          <input className="form-control" placeholder="Buscar curso" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>

        {message && <div className="curso-alert success">{message}</div>}
        {error && <div className="curso-alert error">{error}</div>}

        {cursosLoading ? (
          <div className="text-center py-5 text-muted">Cargando cursos...</div>
        ) : cursosBase.length === 0 ? (
          <div className="text-center py-5 text-muted">No hay cursos disponibles en este momento.</div>
        ) : (
          <>
            <div className="curso-grid">
              {cursosFiltrados.map((curso) => {
                const progreso = Number(progresoCursos[curso.id] || 0);
                const inscrito = progreso > 0;
                const isSelected = cursoSeleccionado?.id === curso.id;

                return (
                  <div key={curso.id} className="curso-item">
                    <article className={`curso-card ${isSelected ? 'curso-card-active' : ''}`}>
                      <div className="curso-card-body">
                        <div className="curso-card-top">
                          <span className="curso-chip">{curso.categoria}</span>
                          <span className="curso-badge">{inscrito ? `${progreso}%` : 'Sin iniciar'}</span>
                        </div>
                        <h3>{curso.titulo}</h3>
                        <p className="curso-description">{curso.descripcion}</p>
                        <p className="small text-muted">{curso.categoria} • {curso.nivel} • {curso.duracion}</p>
                        <div className="curso-progress">
                          <div className="curso-progress-bar">
                            <span style={{ width: `${progreso}%` }} />
                          </div>
                        </div>
                        <div className="curso-actions">
                          <button className="btn btn-sm btn-outline-secondary" onClick={(e) => { e.stopPropagation(); onViewCourseDetail?.(curso); }} type="button">
                            Ver más
                          </button>
                          <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); inscribirse(curso); }} style={{ backgroundColor: COLORS.primary, border: 'none' }} type="button">
                            {inscrito ? 'Continuar' : 'Inscribirme'}
                          </button>
                        </div>
                        {inscrito && (
                          <div className="curso-actions secondary-actions">
                            <button className="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); avanzarCurso(curso); }} type="button">
                              +25%
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={(e) => { e.stopPropagation(); reiniciarCurso(curso); }} type="button">
                              Reiniciar
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {loading && !cursosLoading && <p className="text-muted mt-3">Cargando tu progreso...</p>}
      </div>
    </section>
  );
}
