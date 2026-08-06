import pool from '../config/database.js';

export const getPosts = async (limit = 20, offset = 0) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, u.nombre AS autor, (
         SELECT COUNT(*) FROM comunidad_comments c WHERE c.post_id = p.id
       ) AS comentarios,
       (
         SELECT COUNT(*) FROM comunidad_reacciones r WHERE r.post_id = p.id
       ) AS reacciones
       FROM comunidad_posts p
       JOIN usuarios u ON p.usuario_id = u.id
       ORDER BY p.fecha_publicacion DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), Number(offset)]
    );
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener posts: ${error.message}`);
  }
};

export const getPostById = async (id) => {
  try {
    const [rows] = await pool.query('SELECT p.*, u.nombre AS autor FROM comunidad_posts p JOIN usuarios u ON p.usuario_id = u.id WHERE p.id = ? LIMIT 1', [id]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al obtener post: ${error.message}`);
  }
};

export const createPost = async (usuarioId, categoria, titulo, texto) => {
  try {
    const [result] = await pool.query('INSERT INTO comunidad_posts (usuario_id, categoria, titulo, texto) VALUES (?, ?, ?, ?)', [usuarioId, categoria, titulo, texto]);
    const [rows] = await pool.query('SELECT * FROM comunidad_posts WHERE id = ? LIMIT 1', [result.insertId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al crear post: ${error.message}`);
  }
};

export const updatePost = async (usuarioId, postId, categoria, titulo, texto) => {
  try {
    const [result] = await pool.query('UPDATE comunidad_posts SET categoria = ?, titulo = ?, texto = ? WHERE id = ? AND usuario_id = ?', [categoria, titulo, texto, postId, usuarioId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al actualizar post: ${error.message}`);
  }
};

export const deletePost = async (usuarioId, postId) => {
  try {
    const [result] = await pool.query('DELETE FROM comunidad_posts WHERE id = ? AND usuario_id = ?', [postId, usuarioId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al eliminar post: ${error.message}`);
  }
};

export const createComment = async (usuarioId, postId, texto) => {
  try {
    const [result] = await pool.query('INSERT INTO comunidad_comments (post_id, usuario_id, texto) VALUES (?, ?, ?)', [postId, usuarioId, texto]);
    const [rows] = await pool.query('SELECT c.*, u.nombre AS autor FROM comunidad_comments c JOIN usuarios u ON c.usuario_id = u.id WHERE c.id = ? LIMIT 1', [result.insertId]);
    return rows[0] || null;
  } catch (error) {
    throw new Error(`Error al crear comentario: ${error.message}`);
  }
};

export const getCommentsByPost = async (postId) => {
  try {
    const [rows] = await pool.query('SELECT c.*, u.nombre AS autor FROM comunidad_comments c JOIN usuarios u ON c.usuario_id = u.id WHERE c.post_id = ? ORDER BY c.fecha ASC', [postId]);
    return rows;
  } catch (error) {
    throw new Error(`Error al obtener comentarios: ${error.message}`);
  }
};

export const deleteComment = async (usuarioId, commentId) => {
  try {
    const [result] = await pool.query('DELETE FROM comunidad_comments WHERE id = ? AND usuario_id = ?', [commentId, usuarioId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error(`Error al eliminar comentario: ${error.message}`);
  }
};

export const toggleReaction = async (usuarioId, postId, tipo = 'like') => {
  try {
    const [existing] = await pool.query('SELECT id FROM comunidad_reacciones WHERE usuario_id = ? AND post_id = ? AND tipo = ? LIMIT 1', [usuarioId, postId, tipo]);
    if (existing.length) {
      await pool.query('DELETE FROM comunidad_reacciones WHERE id = ?', [existing[0].id]);
      return { added: false };
    }
    const [result] = await pool.query('INSERT INTO comunidad_reacciones (usuario_id, post_id, tipo) VALUES (?, ?, ?)', [usuarioId, postId, tipo]);
    return { added: true, id: result.insertId };
  } catch (error) {
    throw new Error(`Error al alternar reacción: ${error.message}`);
  }
};

export const countReactions = async (postId) => {
  try {
    const [rows] = await pool.query('SELECT tipo, COUNT(*) as total FROM comunidad_reacciones WHERE post_id = ? GROUP BY tipo', [postId]);
    return rows.reduce((acc, r) => ({ ...acc, [r.tipo]: r.total }), {});
  } catch (error) {
    throw new Error(`Error al contar reacciones: ${error.message}`);
  }
};

export default {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  createComment,
  getCommentsByPost,
  deleteComment,
  toggleReaction,
  countReactions,
};
