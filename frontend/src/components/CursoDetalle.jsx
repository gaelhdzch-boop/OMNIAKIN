import { useState } from 'react';
import '../styles/Cursos.css';
import { COLORS } from '../constants/colors';
import { authService } from '../services/api';

export default function CursoDetalle({ curso, onBack }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  if (!curso) {
    return (
      <section className="curso-detail-page p-5">
        <div className="container">
          <button className="btn btn-link mb-4" onClick={onBack} type="button">
            ← Volver a cursos
          </button>
          <div className="curso-detail-card">
            <div className="curso-detail-copy">
              <span className="curso-chip">Selecciona un curso</span>
              <h3>Elige un curso para ver su detalle completo.</h3>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="curso-detail-page p-5">
      <div className="container">
        <button className="btn btn-link mb-4" onClick={onBack} type="button">
          ← Volver a cursos
        </button>

        <div className="curso-detail-card curso-detail-page-card">
          <div className="curso-detail-copy">
            <span className="curso-chip">Ruta recomendada</span>
            <h1>{curso.titulo}</h1>
            <p>{curso.descripcion}</p>
            <div className="curso-meta curso-detail-meta">
              <span>{curso.categoria}</span>
              <span>{curso.nivel}</span>
              <span>{curso.duracion}</span>
              {curso.precio && <span>{curso.precio}</span>}
            </div>
          </div>

          <div className="curso-detail-list">
            <h4>Qué aprenderás</h4>
            <ul>
              {(curso.aprendizajes || []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          {message && <div className="curso-alert success">{message}</div>}
          {error && <div className="curso-alert error">{error}</div>}
          <div className="curso-detail-info">
            <div>
              <span className="curso-chip">Detalle</span>
              <p><strong>Categoria:</strong> {curso.categoria}</p>
              <p><strong>Nivel:</strong> {curso.nivel}</p>
              <p><strong>Duración:</strong> {curso.duracion}</p>
              {curso.precio && <p><strong>Precio:</strong> {curso.precio}</p>}
            </div>
            <button
              className="btn btn-primary btn-lg"
              style={{ backgroundColor: COLORS.primary, border: 'none' }}
              onClick={async () => {
                try {
                  setSaving(true);
                  setError('');
                  setMessage('');
                  await authService.registerCourse(curso.id, 10);
                  setMessage(`Te inscribiste en "${curso.titulo}" y tu progreso quedó en 10%.`);
                } catch (err) {
                  setError(err.message || 'No se pudo inscribir en el curso.');
                } finally {
                  setSaving(false);
                }
              }}
              type="button"
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Inscribirme'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
