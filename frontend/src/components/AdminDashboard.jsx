import { useEffect, useState } from 'react';
import { adminService, authService, marketplaceService } from '../services/api.js';

const initialCourseForm = {
  titulo: '',
  descripcion: '',
  categoria: '',
  nivel: '',
  instructor: '',
  duracion: '',
  recursos: '',
  precio: '',
};

const initialOpportunityForm = {
  titulo: '',
  organizacion: '',
  categoria: '',
  estado: '',
  descripcion: '',
  monto: '',
  ciudad: '',
  contacto: '',
  requisitos: '',
};

const initialMarketplaceForm = {
  nombreArticulo: '',
  emprendimiento: '',
  categoria: '',
  precio: '',
  ciudad: '',
  contacto: '',
  descripcion: '',
  stock: '',
  imagen: '',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState('courses');
  const [courses, setCourses] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [courseForm, setCourseForm] = useState(initialCourseForm);
  const [opportunityForm, setOpportunityForm] = useState(initialOpportunityForm);
  const [marketplaceForm, setMarketplaceForm] = useState(initialMarketplaceForm);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingOpportunityId, setEditingOpportunityId] = useState(null);
  const [editingMarketplaceId, setEditingMarketplaceId] = useState(null);
  const [users, setUsers] = useState([]);
  const [revealPasswordMap, setRevealPasswordMap] = useState({});
  const [temporaryPasswordMap, setTemporaryPasswordMap] = useState({});
  const [passwordConfirmInputs, setPasswordConfirmInputs] = useState({});
  const [roleChanges, setRoleChanges] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const loadMarketplaceFromLocalStorage = () => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = window.localStorage.getItem('mkt_productos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const persistMarketplace = (items) => {
    setMarketplace(items);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('mkt_productos', JSON.stringify(items));
      } catch (e) {
        console.warn('No se pudo guardar marketplace en localStorage', e);
      }
    }
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError('');
    try {
      const [coursesData, opportunitiesData, marketplaceData, usersData] = await Promise.all([
        adminService.listCourses(),
        adminService.listOpportunities(),
        marketplaceService.listProducts(),
        authService.listUsers(),
      ]);
      setCourses(coursesData.courses || []);
      setOpportunities(opportunitiesData.opportunities || []);
      setUsers(usersData.users || []);
      const backendMarketplace = marketplaceData.products || [];
      if (Array.isArray(backendMarketplace) && backendMarketplace.length > 0) {
        persistMarketplace(backendMarketplace);
      } else {
        const storedMarketplace = loadMarketplaceFromLocalStorage();
        persistMarketplace(storedMarketplace);
      }
    } catch (err) {
      const storedMarketplace = loadMarketplaceFromLocalStorage();
      if (storedMarketplace.length > 0) {
        persistMarketplace(storedMarketplace);
        setError('No se pudieron cargar los datos del servidor, usando productos locales');
      } else {
        setError(err.message || 'No se pudieron cargar los datos admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetCourseForm = () => {
    setCourseForm(initialCourseForm);
    setEditingCourseId(null);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!courseForm.titulo || !courseForm.categoria) {
      setError('Título y categoría son obligatorios para crear el curso');
      return;
    }

    const payload = {
      titulo: courseForm.titulo,
      descripcion: courseForm.descripcion,
      categoria: courseForm.categoria,
      nivel: courseForm.nivel,
      instructor: courseForm.instructor,
      duracion: courseForm.duracion,
      recursos: courseForm.recursos.split(',').map((item) => item.trim()).filter(Boolean),
      precio: Number(courseForm.precio) || 0,
    };

    try {
      if (editingCourseId) {
        const response = await adminService.updateCourse(editingCourseId, payload);
        const updatedCourse = response.course || response;
        setCourses((prev) => prev.map((course) => (course.id === editingCourseId ? updatedCourse : course)));
        setMessage('Curso actualizado correctamente');
        resetCourseForm();
        return;
      }

      await adminService.createCourse(payload);
      setCourseForm(initialCourseForm);
      setMessage('Curso creado correctamente');
      cargarDatos();
    } catch (err) {
      setError(err.message || (editingCourseId ? 'Error al actualizar curso' : 'Error al crear curso'));
    }
  };

  const resetOpportunityForm = () => {
    setOpportunityForm(initialOpportunityForm);
    setEditingOpportunityId(null);
  };

  const handleOpportunitySubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!opportunityForm.titulo || !opportunityForm.organizacion || !opportunityForm.categoria || !opportunityForm.estado || !opportunityForm.descripcion) {
      setError('Título, organización, categoría, estado y descripción son obligatorios');
      return;
    }

    const payload = {
      titulo: opportunityForm.titulo,
      organizacion: opportunityForm.organizacion,
      categoria: opportunityForm.categoria,
      estado: opportunityForm.estado,
      descripcion: opportunityForm.descripcion,
      monto: opportunityForm.monto,
      ciudad: opportunityForm.ciudad,
      contacto: opportunityForm.contacto,
      requisitos: opportunityForm.requisitos.split(',').map((item) => item.trim()).filter(Boolean),
    };

    try {
      if (editingOpportunityId) {
        const response = await adminService.updateOpportunity(editingOpportunityId, payload);
        const updatedOpportunity = response.opportunity || response;
        setOpportunities((prev) => prev.map((op) => (op.id === editingOpportunityId ? updatedOpportunity : op)));
        setMessage('Oportunidad actualizada correctamente');
        resetOpportunityForm();
        return;
      }

      await adminService.createOpportunity(payload);
      setOpportunityForm(initialOpportunityForm);
      setMessage('Oportunidad creada correctamente');
      cargarDatos();
    } catch (err) {
      setError(err.message || (editingOpportunityId ? 'Error al actualizar oportunidad' : 'Error al crear oportunidad'));
    }
  };

  const handleDeleteCourse = async (id) => {
    setError('');
    setMessage('');
    try {
      await adminService.deleteCourse(id);
      setMessage('Curso eliminado correctamente');
      setCourses((prev) => prev.filter((curso) => curso.id !== id));
      if (editingCourseId === id) resetCourseForm();
    } catch (err) {
      setError(err.message || 'Error al eliminar curso');
    }
  };

  const handleEditCourse = (course) => {
    setCourseForm({
      titulo: course.titulo || '',
      descripcion: course.descripcion || '',
      categoria: course.categoria || '',
      nivel: course.nivel || '',
      instructor: course.instructor || '',
      duracion: course.duracion || '',
      recursos: Array.isArray(course.recursos) ? course.recursos.join(', ') : (course.recursos || ''),
      precio: course.precio || '',
    });
    setEditingCourseId(course.id);
    setTab('courses');
  };

  const handleDeleteOpportunity = async (id) => {
    setError('');
    setMessage('');
    try {
      await adminService.deleteOpportunity(id);
      setMessage('Oportunidad eliminada correctamente');
      setOpportunities((prev) => prev.filter((op) => op.id !== id));
      if (editingOpportunityId === id) resetOpportunityForm();
    } catch (err) {
      setError(err.message || 'Error al eliminar oportunidad');
    }
  };

  const handleEditOpportunity = (opportunity) => {
    setOpportunityForm({
      titulo: opportunity.titulo || '',
      organizacion: opportunity.organizacion || '',
      categoria: opportunity.categoria || '',
      estado: opportunity.estado || '',
      descripcion: opportunity.descripcion || '',
      monto: opportunity.monto || '',
      ciudad: opportunity.ciudad || '',
      contacto: opportunity.contacto || '',
      requisitos: Array.isArray(opportunity.requisitos) ? opportunity.requisitos.join(', ') : (opportunity.requisitos || ''),
    });
    setEditingOpportunityId(opportunity.id);
    setTab('opportunities');
  };

  const resetMarketplaceForm = () => {
    setMarketplaceForm(initialMarketplaceForm);
    setEditingMarketplaceId(null);
  };

  const handleEditMarketplaceProduct = (product) => {
    setMarketplaceForm({
      nombreArticulo: product.nombre_articulo || '',
      emprendimiento: product.emprendimiento || '',
      categoria: product.categoria || '',
      precio: product.precio || '',
      ciudad: product.ciudad || '',
      contacto: product.contacto || '',
      descripcion: product.descripcion || '',
      stock: product.stock || '',
      imagen: product.imagen || '',
    });
    setEditingMarketplaceId(product.id);
    setTab('marketplace');
  };

  const handleMarketplaceSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!editingMarketplaceId) {
      setError('Selecciona un producto para editarlo.');
      return;
    }

    const payload = {
      nombreArticulo: marketplaceForm.nombreArticulo,
      emprendimiento: marketplaceForm.emprendimiento,
      categoria: marketplaceForm.categoria,
      precio: Number(marketplaceForm.precio) || 0,
      ciudad: marketplaceForm.ciudad,
      contacto: marketplaceForm.contacto,
      descripcion: marketplaceForm.descripcion,
      stock: Number(marketplaceForm.stock) || 0,
      imagen: marketplaceForm.imagen || null,
    };

    try {
      const response = await marketplaceService.updateProduct(editingMarketplaceId, payload);
      const updatedProduct = response.product || response;
      setMarketplace((prev) => prev.map((item) => (item.id === editingMarketplaceId ? updatedProduct : item)));
      setMessage('Producto actualizado correctamente');
      resetMarketplaceForm();
    } catch (err) {
      setError(err.message || 'Error al actualizar producto');
    }
  };

  const handleDeleteProduct = async (id) => {
    setError('');
    setMessage('');
    try {
      await marketplaceService.deleteProduct(id);
      setMessage('Producto eliminado correctamente');
      setMarketplace((prev) => prev.filter((product) => product.id !== id));
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
    }
  };

  const handleUpdateProductStock = async (id, stock) => {
    setError('');
    setMessage('');
    try {
      const response = await marketplaceService.updateProductStock(id, stock);
      const updatedProduct = response.product || response;
      setMessage('Stock actualizado correctamente');
      setMarketplace((prev) => prev.map((item) => (item.id === id ? updatedProduct : item)));
    } catch (err) {
      setError(err.message || 'Error al actualizar stock');
    }
  };

  const handleRevealPassword = async (userId) => {
    setError('');
    setMessage('');

    const contraseñaAdmin = passwordConfirmInputs[userId] || '';
    if (!contraseñaAdmin) {
      setError('Ingresa tu contraseña de administrador para revelar la contraseña del usuario');
      return;
    }

    try {
      const response = await authService.revealUserPassword(userId, contraseñaAdmin);
      setRevealPasswordMap((prev) => ({ ...prev, [userId]: response.passwordHash }));
      setMessage('Contraseña revelada correctamente (hash).');
    } catch (err) {
      setError(err.message || 'Error al revelar la contraseña');
    }
  };

  const handleResetPassword = async (userId) => {
    setError('');
    setMessage('');

    const contraseñaAdmin = passwordConfirmInputs[userId] || '';
    if (!contraseñaAdmin) {
      setError('Ingresa tu contraseña de administrador para resetear la contraseña del usuario');
      return;
    }

    try {
      const response = await authService.resetUserPassword(userId, contraseñaAdmin);
      setTemporaryPasswordMap((prev) => ({ ...prev, [userId]: response.temporaryPassword }));
      setMessage('Contraseña temporal generada correctamente. Comunícala al usuario de forma segura.');
    } catch (err) {
      setError(err.message || 'Error al resetear la contraseña');
    }
  };

  const handlePasswordInputChange = (userId, value) => {
    setPasswordConfirmInputs((prev) => ({ ...prev, [userId]: value }));
  };

  const handleRoleChange = (userId, newRole) => {
    setRoleChanges((prev) => ({ ...prev, [userId]: newRole }));
  };

  const handleSaveRole = async (userId) => {
    setError('');
    setMessage('');

    const newRole = roleChanges[userId];
    if (!newRole) {
      setError('Selecciona un rol válido antes de guardar.');
      return;
    }

    try {
      await authService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, rol: newRole } : user)));
      setMessage('Rol actualizado correctamente.');
      setRoleChanges((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (err) {
      setError(err.message || 'Error al actualizar el rol');
    }
  };

  return (
    <section className="admin-dashboard container" style={{ padding: '40px 0' }}>
      <div className="section-header" style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 className="section-title">Panel de administrador</h2>
        <p className="section-kicker">Gestiona cursos, oportunidades y marketplace</p>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setTab('courses')}>
          Cursos
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setTab('opportunities')}>
          Oportunidades
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setTab('marketplace')}>
          Marketplace
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setTab('users')}>
          Usuarios
        </button>
      </div>

      {(message || error) && (
        <div style={{ marginBottom: 20 }}>
          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      )}

      {loading ? (
        <div>Cargando datos de administrador...</div>
      ) : tab === 'courses' ? (
        <div>
          <div className="admin-panel" style={{ marginBottom: 32 }}>
            <h3>Crear nuevo curso</h3>
            <form onSubmit={handleCourseSubmit} style={{ display: 'grid', gap: 12 }}>
              <input type="text" placeholder="Título" value={courseForm.titulo} onChange={(e) => setCourseForm((prev) => ({ ...prev, titulo: e.target.value }))} />
              <input type="text" placeholder="Categoría" value={courseForm.categoria} onChange={(e) => setCourseForm((prev) => ({ ...prev, categoria: e.target.value }))} />
              <input type="text" placeholder="Descripción" value={courseForm.descripcion} onChange={(e) => setCourseForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
              <input type="text" placeholder="Nivel" value={courseForm.nivel} onChange={(e) => setCourseForm((prev) => ({ ...prev, nivel: e.target.value }))} />
              <input type="text" placeholder="Instructor" value={courseForm.instructor} onChange={(e) => setCourseForm((prev) => ({ ...prev, instructor: e.target.value }))} />
              <input type="text" placeholder="Duración" value={courseForm.duracion} onChange={(e) => setCourseForm((prev) => ({ ...prev, duracion: e.target.value }))} />
              <input type="text" placeholder="Recursos (separados por coma)" value={courseForm.recursos} onChange={(e) => setCourseForm((prev) => ({ ...prev, recursos: e.target.value }))} />
              <input type="number" placeholder="Precio" value={courseForm.precio} onChange={(e) => setCourseForm((prev) => ({ ...prev, precio: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">
                  {editingCourseId ? 'Actualizar curso' : 'Crear curso'}
                </button>
                {editingCourseId && (
                  <button type="button" className="btn btn-secondary" onClick={resetCourseForm}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-panel">
            <h3>Cursos publicados</h3>
            {courses.length === 0 ? (
              <p>No hay cursos disponibles.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Categoría</th>
                      <th>Instructor</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((course) => (
                      <tr key={course.id}>
                        <td>{course.titulo}</td>
                        <td>{course.categoria}</td>
                        <td>{course.instructor}</td>
                        <td>{course.precio}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleEditCourse(course)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDeleteCourse(course.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : tab === 'opportunities' ? (
        <div>
          <div className="admin-panel" style={{ marginBottom: 32 }}>
            <h3>Crear nueva oportunidad</h3>
            <form onSubmit={handleOpportunitySubmit} style={{ display: 'grid', gap: 12 }}>
              <input type="text" placeholder="Título" value={opportunityForm.titulo} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, titulo: e.target.value }))} />
              <input type="text" placeholder="Organización" value={opportunityForm.organizacion} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, organizacion: e.target.value }))} />
              <input type="text" placeholder="Categoría" value={opportunityForm.categoria} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, categoria: e.target.value }))} />
              <input type="text" placeholder="Estado" value={opportunityForm.estado} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, estado: e.target.value }))} />
              <input type="text" placeholder="Descripción" value={opportunityForm.descripcion} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, descripcion: e.target.value }))} />
              <input type="text" placeholder="Monto" value={opportunityForm.monto} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, monto: e.target.value }))} />
              <input type="text" placeholder="Ciudad" value={opportunityForm.ciudad} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, ciudad: e.target.value }))} />
              <input type="text" placeholder="Contacto" value={opportunityForm.contacto} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, contacto: e.target.value }))} />
              <input type="text" placeholder="Requisitos (separados por coma)" value={opportunityForm.requisitos} onChange={(e) => setOpportunityForm((prev) => ({ ...prev, requisitos: e.target.value }))} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary">
                  {editingOpportunityId ? 'Actualizar oportunidad' : 'Crear oportunidad'}
                </button>
                {editingOpportunityId && (
                  <button type="button" className="btn btn-secondary" onClick={resetOpportunityForm}>
                    Cancelar edición
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="admin-panel">
            <h3>Oportunidades publicadas</h3>
            {opportunities.length === 0 ? (
              <p>No hay oportunidades disponibles.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Organización</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opportunities.map((opportunity) => (
                      <tr key={opportunity.id}>
                        <td>{opportunity.titulo}</td>
                        <td>{opportunity.organizacion}</td>
                        <td>{opportunity.categoria}</td>
                        <td>{opportunity.estado}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleEditOpportunity(opportunity)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDeleteOpportunity(opportunity.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : tab === 'users' ? (
        <div>
          <div className="admin-panel" style={{ marginBottom: 32 }}>
            <h3>Usuarios registrados</h3>
            {users.length === 0 ? (
              <p>No hay usuarios registrados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.nombre}</td>
                        <td>{user.correo}</td>
                        <td>
                          <select
                            value={roleChanges[user.id] ?? user.rol}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            style={{ width: '100%' }}
                          >
                            <option value="usuario">usuario</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>{user.estado}</td>
                        <td style={{ display: 'grid', gap: 8 }}>
                          <input
                            type="password"
                            placeholder="Tu contraseña admin"
                            value={passwordConfirmInputs[user.id] || ''}
                            onChange={(e) => handlePasswordInputChange(user.id, e.target.value)}
                            style={{ width: '100%' }}
                          />
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleRevealPassword(user.id)}>
                              Ver hash
                            </button>
                            <button className="btn btn-sm btn-outline-warning" type="button" onClick={() => handleResetPassword(user.id)}>
                              Resetear contraseña
                            </button>
                          </div>
                          <button className="btn btn-sm btn-success" type="button" onClick={() => handleSaveRole(user.id)}>
                            Guardar rol
                          </button>
                          {revealPasswordMap[user.id] && (
                            <div style={{ wordBreak: 'break-all', fontSize: 12, marginTop: 4 }}>
                              Hash: {revealPasswordMap[user.id]}
                            </div>
                          )}
                          {temporaryPasswordMap[user.id] && (
                            <div style={{ wordBreak: 'break-all', fontSize: 12, marginTop: 4 }}>
                              Contraseña temporal: {temporaryPasswordMap[user.id]}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="admin-panel" style={{ marginBottom: 32 }}>
            <h3>{editingMarketplaceId ? 'Editar producto del marketplace' : 'Selecciona un producto para editar'}</h3>
            {editingMarketplaceId ? (
              <form onSubmit={handleMarketplaceSubmit} style={{ display: 'grid', gap: 12 }}>
                <input type="text" placeholder="Nombre del producto" value={marketplaceForm.nombreArticulo} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, nombreArticulo: e.target.value }))} required />
                <input type="text" placeholder="Emprendimiento" value={marketplaceForm.emprendimiento} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, emprendimiento: e.target.value }))} required />
                <input type="text" placeholder="Categoría" value={marketplaceForm.categoria} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, categoria: e.target.value }))} required />
                <input type="number" placeholder="Precio" value={marketplaceForm.precio} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, precio: e.target.value }))} required />
                <input type="number" placeholder="Stock" value={marketplaceForm.stock} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, stock: e.target.value }))} required />
                <input type="text" placeholder="Ciudad" value={marketplaceForm.ciudad} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, ciudad: e.target.value }))} />
                <input type="text" placeholder="Contacto" value={marketplaceForm.contacto} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, contacto: e.target.value }))} />
                <label style={{ display: 'block', fontWeight: 600, marginTop: 8 }}>Imagen desde el ordenador</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setMarketplaceForm((prev) => ({ ...prev, imagen: reader.result }));
                  reader.onerror = () => setError('No se pudo leer la imagen. Intenta con otro archivo.');
                  reader.readAsDataURL(file);
                }} />
                {marketplaceForm.imagen && (
                  <div style={{ marginTop: 10 }}>
                    <img src={marketplaceForm.imagen} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                  </div>
                )}
                <textarea placeholder="Descripción" value={marketplaceForm.descripcion} onChange={(e) => setMarketplaceForm((prev) => ({ ...prev, descripcion: e.target.value }))} rows={3} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" className="btn btn-primary">Guardar cambios</button>
                  <button type="button" className="btn btn-secondary" onClick={resetMarketplaceForm}>Cancelar</button>
                </div>
              </form>
            ) : (
              <p>Haz clic en "Editar" para modificar un producto.</p>
            )}
          </div>

          <div className="admin-panel">
            <h3>Productos del marketplace</h3>
            {marketplace.length === 0 ? (
              <p>No hay productos publicados.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Emprendimiento</th>
                      <th>Stock</th>
                      <th>Precio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketplace.map((product) => (
                      <tr key={product.id}>
                        <td>{product.nombre_articulo}</td>
                        <td>{product.emprendimiento}</td>
                        <td>
                          <input
                            type="number"
                            defaultValue={product.stock}
                            onBlur={(e) => handleUpdateProductStock(product.id, Number(e.target.value))}
                            style={{ width: 90 }}
                          />
                        </td>
                        <td>{product.precio}</td>
                        <td style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => handleEditMarketplaceProduct(product)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-danger" type="button" onClick={() => handleDeleteProduct(product.id)}>
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
