import '../styles/Comunidad.css';
import { useEffect, useState } from 'react';
import { communityService } from '../services/api.js';

const comunidades = ['General', 'Ayuda', 'Soporte', 'Emprendimiento', 'Bienestar', 'Finanzas'];

export default function Comunidad() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newPost, setNewPost] = useState({ categoria: 'General', titulo: '', texto: '' });

  useEffect(() => {
    cargarPosts(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cargarPosts = async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await communityService.listPosts(p, 20);
      if (p === 1) setPosts(data.posts || []);
      else setPosts((prev) => [...prev, ...(data.posts || [])]);
      setPage(p);
    } catch (err) {
      setError(err.message || 'Error cargando publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const publicar = async () => {
    if (!localStorage.getItem('token')) return alert('Debes iniciar sesión para publicar');
    if (!newPost.titulo || !newPost.texto) return alert('Título y texto son requeridos');
    try {
      const data = await communityService.createPost(newPost);
      setPosts((prev) => [data.post || data, ...prev]);
      setNewPost({ categoria: 'General', titulo: '', texto: '' });
    } catch (err) {
      alert(err.message || 'Error al publicar');
    }
  };

  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');

  const toggleComments = async (postId) => {
    if (openCommentsFor === postId) {
      setOpenCommentsFor(null);
      return;
    }
    try {
      const data = await communityService.getPost(postId);
      setComments((prev) => ({ ...prev, [postId]: data.comments || [] }));
      setOpenCommentsFor(postId);
      // update post counts
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reacciones: data.reactions?.like || p.reacciones, comentarios: data.comments?.length ?? p.comentarios } : p)));
    } catch (err) {
      alert(err.message || 'Error al cargar comentarios');
    }
  };

  const enviarComentario = async (postId) => {
    if (!localStorage.getItem('token')) return alert('Debes iniciar sesión para comentar');
    if (!commentText) return;
    try {
      const data = await communityService.createComment(postId, commentText);
      setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), data.comment || data] }));
      setCommentText('');
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comentarios: (p.comentarios || 0) + 1 } : p)));
    } catch (err) {
      alert(err.message || 'Error al crear comentario');
    }
  };

  const toggleLike = async (postId) => {
    if (!localStorage.getItem('token')) return alert('Debes iniciar sesión para reaccionar');
    try {
      const data = await communityService.toggleReaction(postId, 'like');
      const counts = data.counts || {};
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, reacciones: counts.like ?? p.reacciones } : p)));
    } catch (err) {
      alert(err.message || 'Error al reaccionar');
    }
  };

  return (
    <section id="comunidad" className="comunidad-section">
      <div className="section-header comunidad-header">
        <h2 className="section-title">Comunidad</h2>
        <p className="section-kicker">Comparte ideas, aprende y conéctate con otras emprendedoras</p>
      </div>

      <div className="comunidad-layout container">
        <aside className="comunidad-sidebar">
          <div className="comunidad-panel">
            <h3>Explorar</h3>
            <ul>
              {comunidades.map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="comunidad-link">
                    #{item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="comunidad-main">
          <div className="comunidad-panel comunidad-post-box">
            <div className="select-wrap">
              <select className="custom-select" value={newPost.categoria} onChange={(e) => setNewPost((s) => ({ ...s, categoria: e.target.value }))}>
                {comunidades.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="titulo-wrap">
              <input
                className="titulo-input"
                type="text"
                placeholder="Título (breve)"
                maxLength={120}
                value={newPost.titulo}
                onChange={(e) => setNewPost((s) => ({ ...s, titulo: e.target.value }))}
              />
              <div className="titulo-count">{newPost.titulo.length}/120</div>
            </div>
            <textarea
              placeholder="¿Qué quieres compartir hoy con la comunidad?..."
              aria-label="Escribe una publicación"
              rows="4"
              value={newPost.texto}
              onChange={(e) => setNewPost((s) => ({ ...s, texto: e.target.value }))}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="comunidad-btn" onClick={publicar}>
                Publicar
              </button>
              <button type="button" className="comunidad-btn" onClick={() => setNewPost({ categoria: 'General', titulo: '', texto: '' })}>
                Limpiar
              </button>
            </div>
          </div>

          {error && <div className="comunidad-panel">Error: {error}</div>}

          {posts.map((post) => (
            <article key={post.id} className="comunidad-card">
              <div className="comunidad-card-header">
                <span className="comunidad-badge">{post.categoria}</span>
                <span className="comunidad-meta">
                  {post.autor || 'Anon'} • {new Date(post.fecha_publicacion || post.fecha).toLocaleString()}
                </span>
              </div>
              <h3>{post.titulo}</h3>
              <p>{post.texto}</p>
              <div className="comunidad-card-footer">
                <button onClick={() => toggleLike(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  ❤️ {post.reacciones || 0}
                </button>
                <button onClick={() => toggleComments(post.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  💬 {post.comentarios || 0}
                </button>
              </div>

              {openCommentsFor === post.id && (
                <div style={{ marginTop: 12 }}>
                  <div className="comunidad-panel">
                    {(comments[post.id] || []).map((c) => (
                      <div key={c.id} style={{ marginBottom: 8 }}>
                        <strong>{c.autor}</strong> <span style={{ color: '#6b7280' }}>• {new Date(c.fecha).toLocaleString()}</span>
                        <div>{c.texto}</div>
                      </div>
                    ))}
                    <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                      <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escribe un comentario..." />
                      <button onClick={() => enviarComentario(post.id)} className="comunidad-btn">Comentar</button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}

          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button onClick={() => cargarPosts(page + 1)} className="comunidad-btn" disabled={loading}>
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        </main>

        <aside className="comunidad-widget">
          <div className="comunidad-panel">
            <h3>Mentoras activas</h3>
            <ul>
              <li>Contadora experta</li>
              <li>Mentora digital</li>
              <li>Psicóloga de negocio</li>
            </ul>
          </div>
        </aside>
      </div>
      <div className="comunidad-footer-text">
        Un espacio seguro para inspirarte, resolver dudas y llevar tus proyectos más lejos.
      </div>
    </section>
  );
}
