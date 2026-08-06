import pool from '../config/database.js';

const safeJsonParse = (value, fallback = []) => {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

export const getUserByEmail = async (correo) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al buscar usuario: ${error.message}`);
  }
};

export const getUserById = async (id) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al buscar usuario: ${error.message}`);
  }
};

export const getUserWithPasswordById = async (id) => {
  // Same as getUserById for MySQL schema (contraseña is stored by default)
  return getUserById(id);
};

export const createUser = async (nombre, correo, contraseñaHasheada, preguntaSeguridad = null, respuestaSeguridadHasheada = null) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contraseña, pregunta_seguridad, respuesta_seguridad) VALUES (?, ?, ?, ?, ?)',
      [nombre, correo, contraseñaHasheada, preguntaSeguridad, respuestaSeguridadHasheada]
    );
    return result.insertId;
  } catch (error) {
    throw new Error(`Error al crear usuario: ${error.message}`);
  }
};

export const updateUserPassword = async (id, nuevaContraseñaHasheada) => {
  try {
    await pool.query('UPDATE usuarios SET contraseña = ? WHERE id = ?', [nuevaContraseñaHasheada, id]);
  } catch (error) {
    throw new Error(`Error al actualizar contraseña: ${error.message}`);
  }
};

export const createPasswordResetToken = async (usuarioId, token, expiresAt) => {
  try {
    await pool.query('INSERT INTO tokens_recuperacion (usuario_id, token, fecha_expiracion, usado) VALUES (?, ?, ?, ?)', [usuarioId, token, expiresAt, 0]);
  } catch (error) {
    throw new Error(`Error al crear token de recuperación: ${error.message}`);
  }
};

export const getPasswordResetByToken = async (token) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tokens_recuperacion WHERE token = ? LIMIT 1', [token]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al buscar token de recuperación: ${error.message}`);
  }
};

export const markPasswordResetTokenUsed = async (id) => {
  try {
    await pool.query('UPDATE tokens_recuperacion SET usado = 1 WHERE id = ?', [id]);
  } catch (error) {
    throw new Error(`Error al marcar token como usado: ${error.message}`);
  }
};

export const updateUserProfile = async (id, nombre, fotoPerfil) => {
  try {
    if (fotoPerfil !== undefined) {
      await pool.query('UPDATE usuarios SET nombre = ?, foto_perfil = ? WHERE id = ?', [nombre, fotoPerfil, id]);
    } else {
      await pool.query('UPDATE usuarios SET nombre = ? WHERE id = ?', [nombre, id]);
    }
  } catch (error) {
    throw new Error(`Error al actualizar perfil: ${error.message}`);
  }
};

export const updateUserSecurityQuestion = async (id, preguntaSeguridad, respuestaSeguridadHasheada) => {
  try {
    await pool.query('UPDATE usuarios SET pregunta_seguridad = ?, respuesta_seguridad = ? WHERE id = ?', [preguntaSeguridad, respuestaSeguridadHasheada, id]);
  } catch (error) {
    throw new Error(`Error al actualizar la pregunta de seguridad: ${error.message}`);
  }
};

export const getAllUsers = async () => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, correo, rol, estado FROM usuarios');
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener usuarios: ${error.message}`);
  }
};

export const updateUserRole = async (id, rol) => {
  try {
    await pool.query('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id]);
  } catch (error) {
    throw new Error(`Error al actualizar rol: ${error.message}`);
  }
};

export const getFinanzasMovimientos = async (usuarioId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM finanzas_movimientos WHERE usuario_id = ? ORDER BY fecha_registro DESC, id DESC',
      [usuarioId]
    );
    return rows.map((row) => ({ ...row, monto: Number(row.monto) }));
  } catch (error) {
    throw new Error(`Error al obtener movimientos de finanzas: ${error.message}`);
  }
};

export const createFinanzasMovimiento = async (usuarioId, concepto, categoria, monto, fecha = 'Hoy') => {
  try {
    const [result] = await pool.query(
      'INSERT INTO finanzas_movimientos (usuario_id, concepto, categoria, monto, fecha) VALUES (?, ?, ?, ?, ?)',
      [usuarioId, concepto, categoria, monto, fecha]
    );
    const [rows] = await pool.query('SELECT * FROM finanzas_movimientos WHERE id = ? LIMIT 1', [result.insertId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al crear movimiento de finanzas: ${error.message}`);
  }
};

export const getFinanzasMetas = async (usuarioId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM finanzas_metas WHERE usuario_id = ? ORDER BY id ASC',
      [usuarioId]
    );
    return rows.map((row) => ({ ...row, actual: Number(row.actual), objetivo: Number(row.objetivo) }));
  } catch (error) {
    throw new Error(`Error al obtener metas de finanzas: ${error.message}`);
  }
};

export const saveFinanzasMetas = async (usuarioId, metas = []) => {
  try {
    await pool.query('DELETE FROM finanzas_metas WHERE usuario_id = ?', [usuarioId]);

    for (const meta of metas) {
      const nombre = typeof meta.nombre === 'string' ? meta.nombre.trim() : '';
      const actual = Number(meta.actual) || 0;
      const objetivo = Number(meta.objetivo) || 0;
      const color = typeof meta.color === 'string' ? meta.color : 'rosa';

      if (!nombre) continue;

      await pool.query(
        'INSERT INTO finanzas_metas (usuario_id, nombre, actual, objetivo, color) VALUES (?, ?, ?, ?, ?)',
        [usuarioId, nombre, actual, objetivo, color]
      );
    }

    return getFinanzasMetas(usuarioId);
  } catch (error) {
    throw new Error(`Error al guardar metas de finanzas: ${error.message}`);
  }
};

export const getMarketplaceProducts = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT mp.*, u.nombre AS vendedor_nombre, u.correo AS vendedor_correo, u.foto_perfil AS vendedor_foto_perfil FROM marketplace_productos mp JOIN usuarios u ON mp.usuario_id = u.id WHERE mp.estado = ? ORDER BY mp.fecha_publicacion DESC',
      ['publicado']
    );
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener productos del marketplace: ${error.message}`);
  }
};

export const createMarketplaceProduct = async (usuarioId, nombreArticulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen = null) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO marketplace_productos (usuario_id, nombre_articulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, nombreArticulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen]
    );
    const [rows] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [result.insertId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al crear producto del marketplace: ${error.message}`);
  }
};

export const updateMarketplaceProductStock = async (usuarioId, productoId, stock) => {
  try {
    await pool.query(
      'UPDATE marketplace_productos SET stock = ? WHERE id = ? AND usuario_id = ? AND estado = ?',
      [stock, productoId, usuarioId, 'publicado']
    );
    const [rows] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [productoId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al actualizar el stock del producto: ${error.message}`);
  }
};

export const getMarketplaceProductById = async (productoId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM marketplace_productos WHERE id = ? AND estado = ?',
      [productoId, 'publicado']
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener producto del marketplace: ${error.message}`);
  }
};

export const decrementMarketplaceProductStock = async (productoId, cantidad) => {
  try {
    await pool.query(
      'UPDATE marketplace_productos SET stock = GREATEST(stock - ?, 0) WHERE id = ? AND estado = ?',
      [cantidad, productoId, 'publicado']
    );
    const [rows] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [productoId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al decrementar el stock del producto: ${error.message}`);
  }
};

export const deleteMarketplaceProduct = async (usuarioId, productoId) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM marketplace_productos WHERE id = ? AND usuario_id = ? AND estado = ?',
      [productoId, usuarioId, 'publicado']
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al eliminar el producto del marketplace: ${error.message}`);
  }
};

export const deleteMarketplaceProductAsAdmin = async (productoId) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM marketplace_productos WHERE id = ?',
      [productoId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al eliminar el producto del marketplace como admin: ${error.message}`);
  }
};

export const updateMarketplaceProductStockAsAdmin = async (productoId, stock) => {
  try {
    await pool.query(
      'UPDATE marketplace_productos SET stock = ? WHERE id = ? AND estado = ?',
      [stock, productoId, 'publicado']
    );
    const [rows] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [productoId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al actualizar el stock del producto como admin: ${error.message}`);
  }
};

export const updateMarketplaceProductAsAdmin = async (productoId, nombreArticulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen = null) => {
  try {
    const fields = [];
    const values = [];

    if (nombreArticulo !== undefined && nombreArticulo !== null) {
      fields.push('nombre_articulo = ?');
      values.push(nombreArticulo);
    }
    if (emprendimiento !== undefined && emprendimiento !== null) {
      fields.push('emprendimiento = ?');
      values.push(emprendimiento);
    }
    if (categoria !== undefined && categoria !== null) {
      fields.push('categoria = ?');
      values.push(categoria);
    }
    if (precio !== undefined && precio !== null) {
      fields.push('precio = ?');
      values.push(precio);
    }
    if (ciudad !== undefined) {
      fields.push('ciudad = ?');
      values.push(ciudad);
    }
    if (contacto !== undefined) {
      fields.push('contacto = ?');
      values.push(contacto);
    }
    if (descripcion !== undefined) {
      fields.push('descripcion = ?');
      values.push(descripcion);
    }
    if (stock !== undefined && stock !== null) {
      fields.push('stock = ?');
      values.push(stock);
    }
    if (imagen !== undefined) {
      fields.push('imagen = ?');
      values.push(imagen);
    }

    if (fields.length === 0) {
      const [rows] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [productoId]);
      return rows[0] || null;
    }

    const query = `UPDATE marketplace_productos SET ${fields.join(', ')} WHERE id = ? AND estado = ?`;
    values.push(productoId, 'publicado');

    await pool.query(query, values);
    const [rows] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [productoId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al actualizar el producto del marketplace como admin: ${error.message}`);
  }
};

export const getCourses = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM cursos WHERE estado = ? ORDER BY fecha_creacion DESC', ['activo']);
    return rows.map((row) => ({
      ...row,
      recursos: safeJsonParse(row.recursos, []),
      aprendizajes: safeJsonParse(row.recursos, []),
      precio: Number(row.precio || 0),
    }));
  } catch (error) {
    throw new Error(`Error al obtener cursos: ${error.message}`);
  }
};

export const createCourse = async (titulo, descripcion, categoria, nivel, instructor, duracion, recursos = [], precio = 0) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO cursos (titulo, descripcion, categoria, nivel, instructor, duracion, recursos, precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [titulo, descripcion, categoria, nivel, instructor, duracion, JSON.stringify(recursos), Number(precio)]
    );
    const [rows] = await pool.query('SELECT * FROM cursos WHERE id = ? LIMIT 1', [result.insertId]);
    const row = rows[0] || null;
    return row ? { ...row, recursos: safeJsonParse(row.recursos, []), precio: Number(row.precio || 0) } : null;
  } catch (error) {
    throw new Error(`Error al crear curso: ${error.message}`);
  }
};

export const updateCourse = async (cursoId, titulo, descripcion, categoria, nivel, instructor, duracion, recursos = [], precio = 0, estado = 'activo') => {
  try {
    const [result] = await pool.query(
      'UPDATE cursos SET titulo = ?, descripcion = ?, categoria = ?, nivel = ?, instructor = ?, duracion = ?, recursos = ?, precio = ?, estado = ? WHERE id = ?',
      [titulo, descripcion, categoria, nivel, instructor, duracion, JSON.stringify(recursos), Number(precio), estado, cursoId]
    );
    if (!result.affectedRows) return null;
    const [rows] = await pool.query('SELECT * FROM cursos WHERE id = ? LIMIT 1', [cursoId]);
    const row = rows[0] || null;
    return row ? { ...row, recursos: safeJsonParse(row.recursos, []), precio: Number(row.precio || 0) } : null;
  } catch (error) {
    throw new Error(`Error al actualizar curso: ${error.message}`);
  }
};

export const deleteCourse = async (cursoId) => {
  try {
    const [result] = await pool.query('DELETE FROM cursos WHERE id = ?', [cursoId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al eliminar curso: ${error.message}`);
  }
};

export const getOpportunities = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM oportunidades WHERE estado_publicacion != ? ORDER BY fecha_publicacion DESC', ['Cerrada']);
    return rows.map((row) => ({
      ...row,
      requisitos: safeJsonParse(row.requisitos, []),
      estatus: row.estado_publicacion || 'Abierta',
    }));
  } catch (error) {
    throw new Error(`Error al obtener oportunidades: ${error.message}`);
  }
};

export const createOpportunity = async (titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, requisitos = []) => {
  try {
    const [result] = await pool.query(
      'INSERT INTO oportunidades (titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, requisitos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, JSON.stringify(requisitos)]
    );
    const [rows] = await pool.query('SELECT * FROM oportunidades WHERE id = ? LIMIT 1', [result.insertId]);
    const row = rows[0] || null;
    return row ? { ...row, requisitos: safeJsonParse(row.requisitos, []) } : null;
  } catch (error) {
    throw new Error(`Error al crear oportunidad: ${error.message}`);
  }
};

export const updateOpportunity = async (oportunidadId, titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, requisitos = []) => {
  try {
    const [result] = await pool.query(
      'UPDATE oportunidades SET titulo = ?, organizacion = ?, categoria = ?, estado = ?, descripcion = ?, monto = ?, ciudad = ?, contacto = ?, requisitos = ? WHERE id = ?',
      [titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, JSON.stringify(requisitos), oportunidadId]
    );
    if (!result.affectedRows) return null;
    const [rows] = await pool.query('SELECT * FROM oportunidades WHERE id = ? LIMIT 1', [oportunidadId]);
    const row = rows[0] || null;
    return row ? { ...row, requisitos: safeJsonParse(row.requisitos, []) } : null;
  } catch (error) {
    throw new Error(`Error al actualizar oportunidad: ${error.message}`);
  }
};

export const deleteOpportunity = async (oportunidadId) => {
  try {
    const [result] = await pool.query('DELETE FROM oportunidades WHERE id = ?', [oportunidadId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al eliminar oportunidad: ${error.message}`);
  }
};

export const getUserCourseProgress = async (usuarioId) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cursos_usuario WHERE usuario_id = ? ORDER BY fecha_actualizacion DESC', [usuarioId]);
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener progreso de cursos: ${error.message}`);
  }
};

export const registerUserCourse = async (usuarioId, cursoId, progreso = 10) => {
  try {
    const estado = Number(progreso) >= 100 ? 'completado' : 'inscrito';
    await pool.query(
      `INSERT INTO cursos_usuario (usuario_id, curso_id, progreso, estado) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE progreso = VALUES(progreso), estado = VALUES(estado), fecha_actualizacion = CURRENT_TIMESTAMP`,
      [usuarioId, cursoId, Number(progreso), estado]
    );
    const [rows] = await pool.query('SELECT * FROM cursos_usuario WHERE usuario_id = ? AND curso_id = ? LIMIT 1', [usuarioId, cursoId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al registrar curso: ${error.message}`);
  }
};

export const updateUserCourseProgress = async (usuarioId, cursoId, progreso) => {
  try {
    const estado = Number(progreso) >= 100 ? 'completado' : 'inscrito';
    await pool.query(
      `INSERT INTO cursos_usuario (usuario_id, curso_id, progreso, estado) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE progreso = VALUES(progreso), estado = VALUES(estado), fecha_actualizacion = CURRENT_TIMESTAMP`,
      [usuarioId, cursoId, Number(progreso), estado]
    );
    const [rows] = await pool.query('SELECT * FROM cursos_usuario WHERE usuario_id = ? AND curso_id = ? LIMIT 1', [usuarioId, cursoId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al actualizar progreso de curso: ${error.message}`);
  }
};
