import { useEffect, useState, useRef } from 'react';
import { COLORS } from '../constants/colors';
import { authService } from '../services/api';
import '../styles/Profile.css';
import Finanzas from './Finanzas';

export const Profile = ({ onLogout }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4 MB (match backend limit)

  const [formData, setFormData] = useState({
    nombre: user?.nombre || user?.name || '',
    correo: user?.correo || user?.email || '',
    fotoPerfil: user?.fotoPerfil || user?.foto_perfil || '',
    preguntaSeguridad: '',
    respuestaSeguridad: '',
  });

  const securityQuestions = [
    '¿Cuál es el nombre de tu primera mascota?',
    '¿En qué ciudad nació tu madre?',
    '¿Cuál fue tu colegio de primaria?',
    '¿Cuál es tu color favorito?',
    '¿Cuál fue el primer apellido de tu mejor amiga?',
  ];
  const [avatarPreview, setAvatarPreview] = useState(
    user?.fotoPerfil || user?.foto_perfil || ''
  );
  const [fotoPerfilChanged, setFotoPerfilChanged] = useState(false);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [isFinanzasOpen, setIsFinanzasOpen] = useState(false);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [inscritosPerfil, setInscritosPerfil] = useState([]);
  const [progresoPerfil, setProgresoPerfil] = useState({});
  const [postulacionesPerfil, setPostulacionesPerfil] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        const loadedUser = profile.user || profile;
        setUser(loadedUser);
        setFormData({
          nombre: loadedUser.nombre || loadedUser.name || '',
          correo: loadedUser.correo || loadedUser.email || '',
          fotoPerfil: loadedUser.fotoPerfil || loadedUser.foto_perfil || '',
          preguntaSeguridad: loadedUser.pregunta_seguridad || '',
          respuestaSeguridad: '',
        });
        setAvatarPreview(
          loadedUser.fotoPerfil || loadedUser.foto_perfil || ''
        );
      } catch (err) {
        setError(err.message || 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  useEffect(() => {
    const loadCoursesFromStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('mc_cursosInscritos')) || [];
        const prog = JSON.parse(localStorage.getItem('mc_progresoCursos')) || {};
        setInscritosPerfil(stored);
        setProgresoPerfil(prog);
      } catch (e) {
        // ignore
      }
    };

    const loadCoursesFromApi = async () => {
      if (!localStorage.getItem('token')) {
        return;
      }

      try {
        const data = await authService.getUserCourses();
        const cursos = Array.isArray(data?.courses) ? data.courses : [];
        const ids = cursos.map((curso) => curso.curso_id);
        const progresoMap = cursos.reduce((map, curso) => {
          map[curso.curso_id] = Number(curso.progreso || 0);
          return map;
        }, {});
        if (ids.length) {
          setInscritosPerfil(ids);
          setProgresoPerfil(progresoMap);
        }
      } catch (err) {
        // si hay error de API, mantenemos el cache local
      }
    };

    loadCoursesFromStorage();
    loadCoursesFromApi();

    const loadApplicationsFromStorage = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('userApplications') || '[]');
        setPostulacionesPerfil(Array.isArray(stored) ? stored : []);
      } catch {
        setPostulacionesPerfil([]);
      }
    };

    loadApplicationsFromStorage();

    const handler = (e) => {
      const { cursosInscritos, progresoCursos } = e.detail || {};
      if (Array.isArray(cursosInscritos)) setInscritosPerfil(cursosInscritos);
      if (progresoCursos && typeof progresoCursos === 'object') setProgresoPerfil(progresoCursos);
    };

    const applicationsHandler = () => loadApplicationsFromStorage();

    window.addEventListener('mc:coursesUpdated', handler);
    window.addEventListener('opportunities:updated', applicationsHandler);
    return () => {
      window.removeEventListener('mc:coursesUpdated', handler);
      window.removeEventListener('opportunities:updated', applicationsHandler);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setError('La imagen debe ser menor de 10 MB.');
      setMessage('');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setAvatarPreview(base64);
      setFormData((prev) => ({ ...prev, fotoPerfil: base64 }));
      setFotoPerfilChanged(true);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    if (passwordError) {
      setPasswordError('');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await authService.updateProfile(
        formData.nombre,
        fotoPerfilChanged ? formData.fotoPerfil : undefined,
        formData.preguntaSeguridad,
        formData.respuestaSeguridad
      );
      const updatedUser = {
        ...user,
        nombre: formData.nombre,
        fotoPerfil: fotoPerfilChanged ? formData.fotoPerfil : user?.fotoPerfil || user?.foto_perfil || '',
        pregunta_seguridad: formData.preguntaSeguridad,
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Perfil actualizado correctamente');
    } catch (err) {
      if (err.message && err.message.includes('imagen')) {
        setError(err.message);
      } else {
        setError('Error al actualizar el perfil. Comprueba el tamaño de la imagen.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMessage('');
    setPasswordError('');

    let { currentPassword, newPassword, confirmPassword } = passwordData;
    if (typeof currentPassword === 'string') currentPassword = currentPassword.normalize('NFC');
    if (typeof newPassword === 'string') newPassword = newPassword.normalize('NFC');
    if (typeof confirmPassword === 'string') confirmPassword = confirmPassword.normalize('NFC');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Todos los campos de contraseña son requeridos.');
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres.');
      setPasswordSaving(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden.');
      setPasswordSaving(false);
      return;
    }

    try {
      await authService.changePassword(currentPassword, newPassword, confirmPassword);
      setPasswordMessage('Contraseña actualizada correctamente.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message || 'Error al cambiar la contraseña.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page profile-loading">
        <div className="profile-loader-card">
          <div className="spinner-border text-white" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p>Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <section className="profile-hero">
        <div className="profile-hero-content">
          <h1>Bienvenida, {user?.nombre || 'Emprendedora'}</h1>
          <p>Administra tu perfil, sube tu foto y mantén tu cuenta lista para el éxito.</p>
        </div>
      </section>

      <main className="profile-main container">
        <div className="profile-grid">
          <aside className="profile-card profile-sidebar">
            <div className="profile-avatar-card">
              <div className="profile-avatar-wrapper" onClick={triggerFileSelect} role="button" tabIndex={0} title="Editar foto">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Foto de perfil" className="profile-avatar" />
                ) : (
                  <div className="profile-avatar placeholder">{(formData.nombre || 'U')[0].toUpperCase()}</div>
                )}
                <div className="avatar-edit-overlay">Editar</div>
              </div>
              <h2>{user?.nombre || 'Nombre pendiente'}</h2>
              <p>{user?.correo || 'Correo pendiente'}</p>
              <span className="profile-badge">{user?.rol ? user.rol : 'Usuario'}</span>
              <button
                type="button"
                className="btn btn-outline-light mt-3 profile-logout"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </aside>

          <section className="profile-card profile-form-card">
            <div className="profile-form-header">
              <h2>Editar perfil</h2>
              <p>Actualiza tu nombre, correo y foto para que tu perfil quede completo.</p>
            </div>

            <form onSubmit={handleSave} className="profile-form">
              <div className="profile-form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  value={formData.correo}
                  className="form-control"
                  disabled
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="fotoPerfil">Foto de perfil</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  id="fotoPerfil"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control visually-hidden"
                  style={{ display: 'none' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
                  <button type="button" className="btn btn-outline-secondary btn-upload-photo" onClick={triggerFileSelect}>
                    Cargar foto
                  </button>
                  <small className="text-muted">
                    Sube una imagen cuadrada para mejores resultados. Límite: 10 MB.
                  </small>
                </div>
              </div>

              <div className="profile-form-group">
                <label htmlFor="preguntaSeguridad">Pregunta de seguridad</label>
                <select
                  id="preguntaSeguridad"
                  name="preguntaSeguridad"
                  value={formData.preguntaSeguridad}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="">Selecciona una pregunta</option>
                  {securityQuestions.map((question) => (
                    <option key={question} value={question}>
                      {question}
                    </option>
                  ))}
                </select>
                <small className="text-muted d-block mt-1">
                  Selecciona una pregunta de seguridad para recuperar tu contraseña cuando la olvides.
                </small>
              </div>

              <div className="profile-form-group">
                <label htmlFor="respuestaSeguridad">Respuesta de seguridad</label>
                <input
                  type="text"
                  id="respuestaSeguridad"
                  name="respuestaSeguridad"
                  value={formData.respuestaSeguridad}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Tu respuesta secreta"
                />
              </div>

              {message && <div className="profile-alert profile-success">{message}</div>}
              {error && <div className="profile-alert profile-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary profile-save-btn"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </form>
          </section>

          <section className="profile-card profile-form-card">
            <div className="profile-form-header">
              <button
                type="button"
                className="collapse-toggle"
                onClick={() => setIsPasswordOpen((v) => !v)}
                aria-expanded={isPasswordOpen}
              >
                <div>
                  <h2 style={{ display: 'inline' }}>Cambiar contraseña</h2>
                  <span className="collapse-indicator">{isPasswordOpen ? '▲' : '▼'}</span>
                </div>
                <p className="mb-0">Actualiza tu contraseña actual de forma segura.</p>
              </button>
            </div>

            {isPasswordOpen && (
              <form onSubmit={handlePasswordSave} className="profile-form">
                <div className="profile-form-group">
                  <label htmlFor="currentPassword">Contraseña actual</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    placeholder="Contraseña actual"
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="newPassword">Nueva contraseña</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    placeholder="Nueva contraseña"
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="form-control"
                    placeholder="Confirmar nueva contraseña"
                  />
                </div>

                {passwordMessage && <div className="profile-alert profile-success">{passwordMessage}</div>}
                {passwordError && <div className="profile-alert profile-error">{passwordError}</div>}

                <button
                  type="submit"
                  className="btn btn-primary profile-save-btn"
                  disabled={passwordSaving}
                >
                  {passwordSaving ? 'Guardando...' : 'Cambiar contraseña'}
                </button>
              </form>
            )}
          </section>

          <section className="profile-card profile-form-card">
            <div className="profile-form-header">
              <button
                type="button"
                className="collapse-toggle"
                onClick={() => setIsCoursesOpen((v) => !v)}
                aria-expanded={isCoursesOpen}
              >
                <div>
                  <h2 style={{ display: 'inline' }}>Cursos</h2>
                  <span className="collapse-indicator">{isCoursesOpen ? '▲' : '▼'}</span>
                </div>
                <p className="mb-0">Revisa los cursos inscritos y tu avance.</p>
              </button>
            </div>

            {isCoursesOpen && (
              <div className="profile-courses-list">
                {inscritosPerfil.length > 0 ? (
                  <div className="profile-courses-grid">
                    {inscritosPerfil.map((cursoId) => (
                      <article key={cursoId} className="profile-course-item">
                        <h4>{cursoId.replace(/-/g, ' ')}</h4>
                        <p className="course-category">Curso inscrito</p>
                        <div className="profile-progress-label">
                          <span>Progreso</span>
                          <strong>{progresoPerfil[cursoId] ?? 0}%</strong>
                        </div>
                        <div className="profile-progress-bar" aria-label={`Progreso ${progresoPerfil[cursoId] ?? 0}%`}>
                          <span style={{ width: `${Math.min(100, Number(progresoPerfil[cursoId] ?? 0))}%` }} />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <p>Aún no tienes cursos inscritos.</p>
                    <p>Explora el marketplace y activa tus primeros cursos para verlos aquí.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="profile-card profile-form-card">
            <div className="profile-form-header">
              <button
                type="button"
                className="collapse-toggle"
                onClick={() => setIsApplicationsOpen((v) => !v)}
                aria-expanded={isApplicationsOpen}
              >
                <div>
                  <h2 style={{ display: 'inline' }}>Postulaciones</h2>
                  <span className="collapse-indicator">{isApplicationsOpen ? '▲' : '▼'}</span>
                </div>
                <p className="mb-0">Revisa las oportunidades a las que te postulaste.</p>
              </button>
            </div>

            {isApplicationsOpen && (
              <div className="profile-courses-list">
                {postulacionesPerfil.length > 0 ? (
                  <div className="profile-courses-grid">
                    {postulacionesPerfil.map((postulacion) => (
                      <article key={postulacion.id} className="profile-course-item">
                        <h4>{postulacion.titulo}</h4>
                        <p className="course-category">{postulacion.organizacion}</p>
                        <p className="text-muted small">Estado: {postulacion.estado}</p>
                        <p className="text-muted small">Postulado el {postulacion.fecha}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="profile-empty-state">
                    <p>Aún no tienes postulaciones.</p>
                    <p>Explora oportunidades y postúlate para verlas aquí.</p>
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="profile-card profile-form-card">
            <div className="profile-form-header">
              <button
                type="button"
                className="collapse-toggle"
                onClick={() => setIsFinanzasOpen((v) => !v)}
                aria-expanded={isFinanzasOpen}
              >
                <div>
                  <h2 style={{ display: 'inline' }}>Finanzas</h2>
                  <span className="collapse-indicator">{isFinanzasOpen ? '▲' : '▼'}</span>
                </div>
                <p className="mb-0">Gestiona tus finanzas para tomar mejores decisiones.</p>
              </button>
            </div>

            {isFinanzasOpen && (
              <div className="profile-finanzas-content">
                <Finanzas />
              </div>
            )}
          </section>
        </div>
      </main>
      <div className="profile-footer">
        <button type="button" className="btn-logout-bottom" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
};

