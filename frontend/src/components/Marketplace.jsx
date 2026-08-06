import { useState, useEffect, useRef } from 'react';
import { COLORS } from '../constants/colors';
import { marketplaceService, authService } from '../services/api.js';
import { fileToDataUrl } from '../utils/imageUtils';
import '../styles/Marketplace.css';

const perfilesVendedoras = {
  Carmen: { nombre: 'Carmen López', negocio: 'Artesanías Filigrana', ciudad: 'Oaxaca', contacto: '5512345678', nota: 'Artesana experta tejiendo piezas de joyería tradicional.' },
  Lucía: { nombre: 'Lucía Méndez', negocio: 'Palma Creativa', ciudad: 'Yucatán', contacto: '5587654321', nota: 'Diseñadora enfocada en técnicas de tejido natural.' },
  Marta: { nombre: 'Marta Gómez', negocio: 'Horno Orgánico', ciudad: 'CDMX', contacto: '5599887766', nota: 'Repostería saludable elaborada con ingredientes orgánicos.' }
};

const productosIniciales = [
  { id: 'prod-filigrana', nombre: 'Aretes de filigrana', categoria: 'Artesanías', precio: 320, ciudad: 'Oaxaca', emprendimiento: 'Carmen', descripcion: 'Hermosos aretes hechos a mano por artesanas locales.', stock: 4, contacto: '5512345678', colorFondo: '#f1c40f', imagen: '' },
  { id: 'prod-palma', nombre: 'Bolsa tejida palma', categoria: 'Artesanías', precio: 480, ciudad: 'Yucatán', emprendimiento: 'Lucía', descripcion: 'Bolsa artesanal tejida con palma natural, ideal para el día a día.', stock: 2, contacto: '5587654321', colorFondo: '#e67e22', imagen: '' },
  { id: 'prod-pan', nombre: 'Pan artesanal - 6 pz', categoria: 'Alimentos', precio: 95, ciudad: 'CDMX', emprendimiento: 'Marta', descripcion: 'Paquete de pan horneado en casa, 100% orgánico.', stock: 5, contacto: '5599887766', colorFondo: '#f1948a', imagen: '' }
];

const coloresPastel = ['#f1c40f', '#e67e22', '#f1948a', '#bb8fce', '#85c1e9', '#73c6b6'];

export default function Marketplace() {
    const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  })();
  const usuarioPerfilNombre = currentUser?.nombre || 'Tu perfil';

  const [productos, setProductos] = useState(() => {
    const guardados = localStorage.getItem('mkt_productos');
    return guardados ? JSON.parse(guardados) : productosIniciales;
  });

  const [carrito, setCarrito] = useState(() => {
    const guardados = localStorage.getItem('mkt_carrito');
    return guardados ? JSON.parse(guardados) : [];
  });

  const [historialVentas, setHistorialVentas] = useState(() => {
    const guardados = localStorage.getItem('mkt_historial');
    return guardados ? JSON.parse(guardados) : [];
  });

  const [nombreArticulo, setNombreArticulo] = useState('');
  const [emprendimiento, setEmprendimiento] = useState('');
  const [precio, setPrecio] = useState('');
  const [categoria, setCategoria] = useState('Artesanías');
  const [stock, setStock] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [contacto, setContacto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImageUrl, setEditorImageUrl] = useState(null);
  const [editorScale, setEditorScale] = useState(1);
  const [editorOffset, setEditorOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef(null);
  const [valoresInputStock, setValoresInputStock] = useState({});
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroCiudad, setFiltroCiudad] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [verCarrito, setVerCarrito] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('');
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [resumenCompra, setResumenCompra] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const misStorageKey = `mkt_misExpanded_${currentUser?.id || 'anon'}`;
  const [misExpanded, setMisExpanded] = useState(() => {
    try {
      const raw = localStorage.getItem(misStorageKey);
      if (raw === null) return true;
      return raw === '1';
    } catch (e) {
      return true;
    }
  });

  const toggleMisExpanded = () => {
    setMisExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(misStorageKey, next ? '1' : '0');
      } catch (e) {}
      return next;
    });
  };

  const cargarProductos = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true);
    setFetchError('');
    try {
      const resp = await marketplaceService.listProducts();
      const loadedProducts = resp.products || resp;
      if (Array.isArray(loadedProducts) && loadedProducts.length > 0) {
        setProductos(loadedProducts);
      }
    } catch (err) {
      console.error('Error cargando marketplace:', err);
      setFetchError(err.message || 'No se pudieron cargar los productos del marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  // keep state in sync if user changes (e.g., login/logout)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(misStorageKey);
      if (raw !== null) setMisExpanded(raw === '1');
    } catch (e) {}
  }, [misStorageKey]);

  useEffect(() => {
    localStorage.setItem('mkt_productos', JSON.stringify(productos));
  }, [productos]);

  useEffect(() => {
    cargarProductos();
  }, []);

  useEffect(() => {
    localStorage.setItem('mkt_carrito', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem('mkt_historial', JSON.stringify(historialVentas));
  }, [historialVentas]);

  const mostrarToast = (msg) => {
    setToastMensaje(msg);
    setTimeout(() => setToastMensaje(''), 3000);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setEditorImageUrl(dataUrl);
        setEditorScale(1);
        setEditorOffset({ x: 0, y: 0 });
        setEditorOpen(true);
      } catch (err) {
        alert(err.message || 'Error al leer la imagen');
        e.target.value = '';
      }
    }
  };

  const onEditorMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, ox: editorOffset.x, oy: editorOffset.y };
  };

  const onEditorMouseMove = (e) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setEditorOffset({ x: dragStartRef.current.ox + dx, y: dragStartRef.current.oy + dy });
  };

  const onEditorMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const acceptCroppedImage = () => {
    if (!editorImageUrl) return;
    const canvas = document.createElement('canvas');
    const outputSize = 1000; // px, square
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = editorImageUrl;
    img.onload = () => {
      // Calculate draw parameters based on scale and offset
      // We'll fit the image so that its center + offset maps into canvas center
      const iw = img.width;
      const ih = img.height;
      const scale = editorScale;

      // Draw image centered and transformed
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, outputSize, outputSize);

      // Compute scaled size
      const sw = iw * scale;
      const sh = ih * scale;

      // Compute top-left to draw such that the image center is at canvas center plus offset
      const cx = outputSize / 2 - editorOffset.x;
      const cy = outputSize / 2 - editorOffset.y;
      const dx = cx - sw / 2;
      const dy = cy - sh / 2;

      ctx.drawImage(img, dx, dy, sw, sh);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagenUrl(dataUrl);
      setEditorOpen(false);
      setEditorImageUrl(null);
      mostrarToast('Imagen ajustada y guardada');
    };
    img.onerror = () => alert('No se pudo procesar la imagen');
  };

  const handleGuardarPublicacion = async (e) => {
    e.preventDefault();

    const colorAzar = coloresPastel[Math.floor(Math.random() * coloresPastel.length)];
    const nuevoId = 'prod-' + Date.now();

    const nuevoProducto = {
      id: nuevoId,
      nombre: currentUser?.nombre || usuarioPerfilNombre,
      usuario_id: currentUser?.id || null,
      vendedor_nombre: currentUser?.nombre || usuarioPerfilNombre,
      propio: true,
      emprendimiento,
      categoria,
      precio: parseFloat(precio),
      ciudad: ciudad.trim(),
      nombreArticulo,
      descripcion,
      stock: parseInt(stock, 10),
      contacto,
      colorFondo: colorAzar,
      imagen: imagenUrl
    };

    // Si el usuario está autenticado, enviar al backend
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = {
          nombreArticulo,
          emprendimiento,
          categoria,
          precio: parseFloat(precio),
          ciudad: ciudad || null,
          contacto: contacto || null,
          descripcion: descripcion || null,
          stock: parseInt(stock, 10),
          imagen: imagenUrl || null,
        };
        const resp = await marketplaceService.createProduct(payload);
        const saved = resp.product || resp;
        setProductos([saved, ...productos]);
        mostrarToast('Publicación guardada en el servidor');
      } catch (err) {
        console.error('Error al guardar en backend:', err);
        // fallback local
        setProductos([nuevoProducto, ...productos]);
        setFetchError('No se pudo guardar en el servidor. Publicación guardada localmente.');
        mostrarToast('Publicación guardada localmente (error servidor)');
      }
    } else {
      setProductos([nuevoProducto, ...productos]);
      mostrarToast('Publicación guardada');
    }

    setNombreArticulo('');
    setEmprendimiento('');
    setPrecio('');
    setStock('');
    setCiudad('');
    setContacto('');
    setDescripcion('');
    setImagenUrl('');
  };

  const handleCambiarInputStock = (productoId, valor) => {
    setValoresInputStock({
      ...valoresInputStock,
      [productoId]: valor
    });
  };

  const handleGuardarStockIndividual = (productoId) => {
    const nuevoValor = parseInt(valoresInputStock[productoId], 10);
    if (isNaN(nuevoValor) || nuevoValor < 0) {
      alert('Ingresa un número válido');
      return;
    }

    setProductos(productos.map((p) => (p.id === productoId ? { ...p, stock: nuevoValor } : p)));
    mostrarToast('Stock actualizado');

    setValoresInputStock({
      ...valoresInputStock,
      [productoId]: ''
    });
  };

  const handleVaciarHistorial = () => {
    if (window.confirm('¿Deseas limpiar todo el historial de ventas?')) {
      setHistorialVentas([]);
      localStorage.removeItem('mkt_historial');
      mostrarToast('Historial vaciado');
    }
  };

  const handleAbrirPerfil = (nombreMarca, nombrePersona) => {
    if (perfilesVendedoras[nombreMarca]) {
      setVendedoraSeleccionada(perfilesVendedoras[nombreMarca]);
    } else {
      const productoAsociado = productos.find((p) => p.emprendimiento === nombreMarca);
      setVendedoraSeleccionada({
        nombre: nombrePersona || productoAsociado?.nombre || usuarioPerfilNombre,
        negocio: nombreMarca,
        ciudad: productoAsociado?.ciudad || 'Cuautitlán',
        contacto: productoAsociado?.contacto || '',
        nota: 'Emprendimiento verificado registrado en nuestro catálogo de Marketplace.'
      });
    }
  };

  const handleAñadirAlCarrito = (producto) => {
    if (producto.stock <= 0) {
      mostrarToast('Este producto ya no tiene stock disponible');
      return;
    }

    const productoEnCarrito = carrito.find((item) => item.id === producto.id);

    if (productoEnCarrito) {
      setCarrito(
        carrito.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setCarrito([...carrito, { ...producto, cantidad: 1 }]);
    }

    setProductos(productos.map((p) => (p.id === producto.id ? { ...p, stock: p.stock - 1 } : p)));
    setVerCarrito(true);
    mostrarToast('Producto agregado al carrito');
  };

  const handleCambiarCantidad = (productoId, delta) => {
    const itemActual = carrito.find((item) => item.id === productoId);
    if (!itemActual) return;

    if (delta === 1) {
      const productoDisponible = productos.find((p) => p.id === productoId);
      if (!productoDisponible || productoDisponible.stock <= 0) {
        mostrarToast('No hay más stock disponible');
        return;
      }

      setCarrito(
        carrito.map((item) => (item.id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item))
      );
      setProductos(productos.map((p) => (p.id === productoId ? { ...p, stock: p.stock - 1 } : p)));
      return;
    }

    if (itemActual.cantidad > 1) {
      setCarrito(
        carrito.map((item) => (item.id === productoId ? { ...item, cantidad: item.cantidad - 1 } : item))
      );
      setProductos(productos.map((p) => (p.id === productoId ? { ...p, stock: p.stock + 1 } : p)));
    } else {
      handleEliminarDelCarrito(productoId);
    }
  };

  const handleEliminarDelCarrito = (productoId) => {
    const item = carrito.find((producto) => producto.id === productoId);
    if (!item) return;

    setCarrito(carrito.filter((producto) => producto.id !== productoId));
    setProductos(productos.map((p) => (p.id === productoId ? { ...p, stock: p.stock + item.cantidad } : p)));
  };

  const handleEliminarPublicacion = async (productoId) => {
    if (!window.confirm('¿Deseas eliminar esta publicación?')) return;

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await marketplaceService.deleteProduct(productoId);
        setProductos((prevProductos) => prevProductos.filter((p) => p.id !== productoId));
        setCarrito((prevCarrito) => prevCarrito.filter((c) => c.id !== productoId));
        mostrarToast('Publicación eliminada');
        return;
      } catch (error) {
        console.error('Error eliminando publicación:', error);
        mostrarToast('No se pudo eliminar en el servidor. Se eliminó localmente.');
      }
    }

    setProductos((prevProductos) => prevProductos.filter((p) => p.id !== productoId));
    setCarrito((prevCarrito) => prevCarrito.filter((c) => c.id !== productoId));
  };

  const handleFinalizarCompra = async () => {
    if (carrito.length === 0) return;

    setResumenCompra([...carrito]);

    const nuevasVentasHistorial = carrito.map((item) => ({
      idHistorial: 'item-' + Date.now() + '-' + Math.random(),
      nombreItem: item.nombreArticulo || item.nombre,
      precio: item.precio * item.cantidad,
      emprendimiento: item.emprendimiento,
      vendedora: item.nombre,
      fecha: new Date().toLocaleDateString('es-MX')
    }));

    const purchasePayload = {
      items: carrito.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        monto: item.precio * item.cantidad,
        sellerId: item.usuario_id || item.sellerId || null,
        nombreArticulo: item.nombreArticulo || item.nombre,
        fecha: new Date().toLocaleDateString('es-MX'),
      })),
    };

    const token = localStorage.getItem('token');
    if (token) {
      try {
        await authService.purchaseMarketplace(purchasePayload);
        window.dispatchEvent(new Event('finanzasActualizadas'));
        mostrarToast('Compra registrada en finanzas.');
      } catch (error) {
        console.error('Error al registrar compra en finanzas:', error);
        mostrarToast('Compra completada, pero no se pudo registrar en finanzas.');
      }
    }

    setHistorialVentas([...nuevasVentasHistorial, ...historialVentas]);
    setCarrito([]);
    setVerCarrito(false);
    if (!token) mostrarToast('Compra completada localmente. Inicia sesión para registrar en finanzas.');
  };

  const ciudadesDisponibles = ['Todos', ...new Set(productos.map((p) => p.ciudad).filter(Boolean))];

  const productosFiltrados = productos.filter((p) => {
    const tituloProducto = p.nombreArticulo || p.nombre;
    const cumpleCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    const cumpleCiudad = filtroCiudad === 'Todos' || p.ciudad.toLowerCase() === filtroCiudad.toLowerCase();
    const cumpleBusqueda = !busqueda || tituloProducto.toLowerCase().includes(busqueda.toLowerCase()) || p.emprendimiento.toLowerCase().includes(busqueda.toLowerCase()) || p.ciudad.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleCategoria && cumpleCiudad && cumpleBusqueda;
  });

  // separar mis articulos (del usuario) y el resto — ahora respetando filtros
  const misArticulos = productosFiltrados.filter((p) => {
    if (p.propio) return true;
    if (!currentUser) return false;
    return (
      (p.usuario_id && String(p.usuario_id) === String(currentUser.id)) ||
      p.vendedor_nombre === currentUser.nombre ||
      p.nombre === currentUser.nombre
    );
  });

  const otrosProductos = productosFiltrados.filter((p) => !misArticulos.find((m) => m.id === p.id));

  const totalCarrito = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const renderProductCard = (p) => {
    const agotado = p.stock <= 0;
    const tituloCard = p.nombreArticulo || p.nombre;
    const esPropio = p.propio || (currentUser && ((p.usuario_id && String(p.usuario_id) === String(currentUser.id)) || p.vendedor_nombre === currentUser.nombre || p.nombre === currentUser.nombre));
    const puedeEliminar = esPropio || currentUser?.rol === 'admin';

    return (
      <article className="mkt-product-card" key={p.id}>
        {puedeEliminar && (
          <button type="button" className="mkt-delete-post" onClick={() => handleEliminarPublicacion(p.id)} title="Eliminar Publicación">
            ×
          </button>
        )}

        <div className="mkt-img-block" style={{ backgroundColor: p.imagen ? 'transparent' : p.colorFondo }}>
          {p.imagen ? (
            <img src={p.imagen} alt={tituloCard} />
          ) : (
            <span style={{ color: 'white', fontWeight: 'bold', letterSpacing: '1px', fontSize: '0.8rem' }}>{p.categoria.toUpperCase()}</span>
          )}
        </div>

        <div className="mkt-product-body">
          <div className="mkt-product-title-row">
            <h3 className="mkt-product-title">{tituloCard}</h3>
            {esPropio && <span className="mkt-product-badge">Mi producto</span>}
          </div>

          <button type="button" className="mkt-product-vendor" onClick={() => handleAbrirPerfil(p.emprendimiento, p.nombre)}>
            @{p.emprendimiento} • {p.ciudad}
          </button>

          <p className="mkt-product-desc-short">{p.descripcion}</p>

          <div className="mkt-footer-row">
            <div>
              <span className="mkt-product-price">${p.precio} MXN</span>
              <span className="mkt-stock-indicator">{agotado ? 'Sin existencias' : `Disponibles: ${p.stock} u.`}</span>

              {esPropio && (
                <div className="mkt-stock-actions">
                  <input type="number" min="0" className="mkt-stock-mini-input" placeholder="Cant." value={valoresInputStock[p.id] || ''} onChange={(e) => handleCambiarInputStock(p.id, e.target.value)} />
                  <button type="button" className="mkt-stock-save-btn" onClick={() => handleGuardarStockIndividual(p.id)}>
                    Guardar
                  </button>
                </div>
              )}
            </div>

            <button type="button" className="mkt-contact-btn" disabled={agotado} onClick={() => handleAñadirAlCarrito(p)}>
              {agotado ? 'Agotado' : 'Agregar'}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="mkt-page-wrapper">
      <header className="mkt-main-header">
        <span className="mkt-vinculo">Vinculación Comercial</span>
        <h1>Marketplace de emprendedoras</h1>
        <p>Un catálogo para publicar, buscar y consultar productos o servicios ofrecidos por mujeres emprendedoras.</p>
        {isLoading && <p style={{ color: '#8b5cf6' }}>Cargando productos del servidor...</p>}
        {fetchError && <p style={{ color: '#dc2626' }}>{fetchError}</p>}
      </header>

      <div className="mkt-container">
        <aside className="mkt-sidebar">
          <form className="mkt-form-card" onSubmit={handleGuardarPublicacion}>
            <h4>Publicación Rápida</h4>
            <p>Sube tu producto o servicio</p>

            <label>Nombre de la Vendedora (Tu Perfil)</label>
            <input type="text" value={usuarioPerfilNombre} readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} />

            <label>Nombre de tu Marca o Tienda</label>
            <input type="text" placeholder="Ej. Vacabonita" value={emprendimiento} onChange={(e) => setEmprendimiento(e.target.value)} required />

            <label>Nombre del Artículo</label>
            <input type="text" placeholder="Ej. Pulseras artesanales" value={nombreArticulo} onChange={(e) => setNombreArticulo(e.target.value)} required />

            <label>Imagen del producto</label>
            <div className="mkt-file-upload">
              <input type="file" accept="image/*" onChange={handleImageChange} id="file-input" />
              <label htmlFor="file-input" className="file-label">Seleccionar archivo</label>
              {imagenUrl && (
                <div className="mkt-image-thumb">
                  <img src={imagenUrl} alt="Preview" />
                </div>
              )}
            </div>

            {editorOpen && (
              <div className="mkt-editor-backdrop">
                <div className="mkt-editor-modal">
                  <div className="mkt-editor-canvas"
                    onMouseDown={onEditorMouseDown}
                    onMouseMove={onEditorMouseMove}
                    onMouseUp={onEditorMouseUp}
                    onMouseLeave={onEditorMouseUp}
                  >
                    <img
                      src={editorImageUrl}
                      alt="Editor"
                      style={{ transform: `translate(${editorOffset.x}px, ${editorOffset.y}px) scale(${editorScale})` }}
                      draggable={false}
                    />
                  </div>
                  <div className="mkt-editor-controls">
                    <label>Zoom</label>
                    <input type="range" min="0.5" max="3" step="0.01" value={editorScale} onChange={(e) => setEditorScale(Number(e.target.value))} />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button type="button" className="mkt-btn" onClick={acceptCroppedImage}>Aceptar</button>
                      <button type="button" className="mkt-btn mkt-btn-secondary" onClick={() => { setEditorOpen(false); setEditorImageUrl(null); }}>Cancelar</button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 8 }}>Arrastra la imagen para posicionarla, usa el control de zoom para ajustar.</p>
                  </div>
                </div>
              </div>
            )}

            <label>Categoría</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="Artesanías">Artesanías</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Servicios">Servicios</option>
              <option value="Moda">Moda</option>
            </select>

            <label>Precio de Venta ($)</label>
            <input type="number" min="1" placeholder="Ej. 180" value={precio} onChange={(e) => setPrecio(e.target.value)} required />

            <label>Disponibilidad Inicial (Stock)</label>
            <input type="number" min="1" placeholder="Ej. 3" value={stock} onChange={(e) => setStock(e.target.value)} required />

            <label>Ciudad o modalidad</label>
            <input type="text" placeholder="Ej. Cuautitlán o En línea" value={ciudad} onChange={(e) => setCiudad(e.target.value)} required />

            <label>WhatsApp o Teléfono de Contacto</label>
            <input type="text" placeholder="Ej. 5512345678" value={contacto} onChange={(e) => setContacto(e.target.value)} required />

            <label>Descripción</label>
            <textarea rows="3" placeholder="Cuenta qué ofreces..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />

            <button type="submit" style={{ backgroundColor: COLORS.primary }} className="mkt-submit">
              Guardar publicación
            </button>
          </form>

          <div className="mkt-history-card">
            <h4>Historial de Ventas</h4>
            <p>Tratos cerrados y vinculaciones exitosas</p>
            {historialVentas.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#8c6375', fontStyle: 'italic' }}>Aún no hay registros de ventas.</p>
            ) : (
              <>
                <ul className="mkt-history-list">
                  {historialVentas.map((item) => (
                    <li className="mkt-history-item" key={item.idHistorial}>
                      <strong>{item.fecha}</strong> - {item.nombreItem} (${item.precio} MXN)<br />
                      <span>Marca: </span>
                      <button type="button" className="mkt-product-vendor" onClick={() => handleAbrirPerfil(item.emprendimiento, item.vendedora)}>
                        {item.emprendimiento}
                      </button>
                    </li>
                  ))}
                </ul>
                <button type="button" className="mkt-clear-history-btn" onClick={handleVaciarHistorial}>
                  🗑️ Limpiar historial
                </button>
              </>
            )}
          </div>
        </aside>

        <main className="mkt-main">
          <div className="mkt-controls-bar">
            <input className="mkt-search-input" placeholder="Buscar producto, negocio, ciudad o emprendedora..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />

            <select className="mkt-select-filter" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
              <option value="Todas">Todas las categorías</option>
              <option value="Artesanías">Artesanías</option>
              <option value="Alimentos">Alimentos</option>
              <option value="Servicios">Servicios</option>
              <option value="Moda">Moda</option>
            </select>

            <select className="mkt-select-filter" value={filtroCiudad} onChange={(e) => setFiltroCiudad(e.target.value)}>
              {ciudadesDisponibles.map((c, i) => (
                <option key={i} value={c}>{c === 'Todos' ? 'Todo México' : c}</option>
              ))}
            </select>

            <button type="button" className="mkt-cart-toggle" onClick={() => setVerCarrito(!verCarrito)}>
              🛒 Mi Carrito ({carrito.length})
            </button>
          </div>

          {verCarrito && (
            <div className="mkt-cart-dropdown">
              <h4 className="mkt-cart-title">🛒 Mi Carrito</h4>
              {carrito.length === 0 ? (
                <p className="mkt-cart-empty">Tu carrito está vacío.</p>
              ) : (
                <>
                  {carrito.map((item) => (
                    <div className="mkt-cart-item" key={item.id}>
                      <div className="mkt-cart-item-info">
                        <h5>{item.nombreArticulo || item.nombre}</h5>
                        <p>
                          Marca:{' '}
                          <button type="button" className="mkt-product-vendor" onClick={() => handleAbrirPerfil(item.emprendimiento, item.nombre)}>
                            <strong>{item.emprendimiento}</strong>
                          </button>{' '}
                          | Tel: <strong>{item.contacto}</strong>
                        </p>
                        <p style={{ color: '#db2777', fontWeight: 'bold' }}>${item.precio * item.cantidad} MXN</p>
                      </div>
                      <div className="mkt-cart-controls">
                        <div className="mkt-cart-quantity">
                          <button type="button" className="mkt-cart-qty-btn" onClick={() => handleCambiarCantidad(item.id, -1)}>-</button>
                          <span>{item.cantidad}</span>
                          <button type="button" className="mkt-cart-qty-btn" onClick={() => handleCambiarCantidad(item.id, 1)}>+</button>
                        </div>
                        <button type="button" className="mkt-cart-remove" onClick={() => handleEliminarDelCarrito(item.id)}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="mkt-cart-footer">
                    <span className="mkt-cart-total">Total: ${totalCarrito} MXN</span>
                    <button type="button" className="mkt-cart-checkout" style={{ backgroundColor: COLORS.primary }} onClick={handleFinalizarCompra}>
                      Finalizar compra
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {misArticulos.length > 0 && (
            <section className="mkt-section mkt-mis-articulos">
              <div className="mkt-section-header">
                <h3>Mis artículos</h3>
                <button type="button" className={`mkt-toggle-btn ${misExpanded ? 'open' : 'collapsed'}`} onClick={toggleMisExpanded} aria-expanded={misExpanded} aria-label={misExpanded ? 'Colapsar Mis artículos' : 'Expandir Mis artículos'}>
                  <span className="mkt-toggle-icon">{misExpanded ? '▾' : '▸'}</span>
                </button>
              </div>
              {misExpanded && (
                <div className="mkt-section-grid">
                  {misArticulos.map((p) => renderProductCard(p))}
                </div>
              )}
            </section>
          )}

          <section className="mkt-section mkt-marketplace">
            <div className="mkt-section-header">
              <h3>Marketplace</h3>
            </div>
            <div className="mkt-section-grid">
              {otrosProductos.length === 0 ? (
                <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#64748b', padding: '40px' }}>No se encontraron productos que coincidan con la búsqueda.</p>
              ) : (
                otrosProductos.map((p) => renderProductCard(p))
              )}
            </div>
          </section>
        </main>
      </div>

      {vendedoraSeleccionada && (
        <div className="mkt-modal-overlay" onClick={() => setVendedoraSeleccionada(null)}>
          <div className="mkt-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="mkt-modal-close" onClick={() => setVendedoraSeleccionada(null)}>
              ×
            </button>
            <div className="mkt-modal-avatar">M</div>
            <h3>{vendedoraSeleccionada.nombre}</h3>
            <span className="mkt-modal-badge">{vendedoraSeleccionada.negocio}</span>
            <p style={{ fontSize: '0.8rem', color: '#be185d', fontWeight: 'bold', marginBottom: '10px' }}>📍 {vendedoraSeleccionada.ciudad}</p>
            <p className="mkt-modal-desc">{vendedoraSeleccionada.nota}</p>
            <a href={`https://wa.me${vendedoraSeleccionada.contacto}`} target="_blank" rel="noopener noreferrer" className="mkt-modal-whatsapp-btn">
              💬 Enviar Mensaje por WhatsApp
            </a>
          </div>
        </div>
      )}

      {resumenCompra && (
        <div className="mkt-modal-overlay" onClick={() => setResumenCompra(null)}>
          <div className="mkt-modal-card" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="mkt-modal-close" onClick={() => setResumenCompra(null)}>
              ×
            </button>
            <div className="mkt-modal-avatar">🛍️</div>
            <h3>¡Proceso de Vinculación!</h3>
            <span className="mkt-modal-badge">Trato Directo con la Vendedora</span>
            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '15px', textAlign: 'left' }}>Para concretar la compra de tus artículos, por favor contacta de forma externa a las emprendedoras:</p>
            <ul className="mkt-summary-list">
              {resumenCompra.map((item, idx) => (
                <li key={idx} className="mkt-summary-item">
                  <strong>{item.nombreArticulo || item.nombre}</strong><br />
                  <span style={{ fontSize: '0.8rem', color: '#be185d' }}>Marca: {item.emprendimiento} | Tel: {item.contacto}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="mkt-submit" style={{ backgroundColor: COLORS.primary }} onClick={() => setResumenCompra(null)}>
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}

      {toastMensaje && <div className="mkt-toast">{toastMensaje}</div>}
    </div>
  );
}
