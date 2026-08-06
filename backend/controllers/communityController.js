import {
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
} from '../models/communityModel.js';

export const listPosts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const posts = await getPosts(limit, offset);
    res.status(200).json({ posts });
  } catch (error) {
    console.error('Error listando posts:', error);
    res.status(500).json({ message: 'Error al obtener publicaciones' });
  }
};

export const getPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await getPostById(postId);
    if (!post) return res.status(404).json({ message: 'Publicación no encontrada' });
    const comments = await getCommentsByPost(postId);
    const reactions = await countReactions(postId);
    res.status(200).json({ post, comments, reactions });
  } catch (error) {
    console.error('Error al obtener post:', error);
    res.status(500).json({ message: 'Error al obtener la publicación' });
  }
};

export const createPostController = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { categoria, titulo, texto } = req.body;
    if (!titulo || !texto) return res.status(400).json({ message: 'Título y texto son requeridos' });
    const post = await createPost(usuarioId, categoria || 'General', titulo, texto);
    res.status(201).json({ message: 'Publicación creada', post });
  } catch (error) {
    console.error('Error al crear publicación:', error);
    res.status(500).json({ message: 'Error al crear la publicación' });
  }
};

export const updatePostController = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const postId = req.params.id;
    const { categoria, titulo, texto } = req.body;
    const ok = await updatePost(usuarioId, postId, categoria || 'General', titulo, texto);
    if (!ok) return res.status(404).json({ message: 'No encontrado o sin permisos' });
    res.status(200).json({ message: 'Publicación actualizada' });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    res.status(500).json({ message: 'Error al actualizar la publicación' });
  }
};

export const deletePostController = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const postId = req.params.id;
    const ok = await deletePost(usuarioId, postId);
    if (!ok) return res.status(404).json({ message: 'No encontrado o sin permisos' });
    res.status(200).json({ message: 'Publicación eliminada' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    res.status(500).json({ message: 'Error al eliminar la publicación' });
  }
};

export const createCommentController = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const postId = req.params.id;
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ message: 'El texto es requerido' });
    const comment = await createComment(usuarioId, postId, texto);
    res.status(201).json({ message: 'Comentario creado', comment });
  } catch (error) {
    console.error('Error al crear comentario:', error);
    res.status(500).json({ message: 'Error al crear el comentario' });
  }
};

export const deleteCommentController = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const commentId = req.params.id;
    const ok = await deleteComment(usuarioId, commentId);
    if (!ok) return res.status(404).json({ message: 'No encontrado o sin permisos' });
    res.status(200).json({ message: 'Comentario eliminado' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    res.status(500).json({ message: 'Error al eliminar el comentario' });
  }
};

export const toggleReactionController = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const postId = req.params.id;
    const { tipo } = req.body;
    const result = await toggleReaction(usuarioId, postId, tipo || 'like');
    const counts = await countReactions(postId);
    res.status(200).json({ message: result.added ? 'Reacción añadida' : 'Reacción removida', counts });
  } catch (error) {
    console.error('Error al alternar reacción:', error);
    res.status(500).json({ message: 'Error al procesar la reacción' });
  }
};
