import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants/colors';
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
  const USUARIO_LOGUEADO = 'Juan Pérez';

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
  const [valoresInputStock, setValoresInputStock] = useState({});
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [filtroCiudad, setFiltroCiudad] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [verCarrito, setVerCarrito] = useState(false);
  const [toastMensaje, setToastMensaje] = useState('');
  const [vendedoraSeleccionada, setVendedoraSeleccionada] = useState(null);
  const [resumenCompra, setResumenCompra] = useState(null);

  useEffect(() => {
    localStorage.setItem('mkt_productos', JSON.stringify(productos));
  }, [productos]);

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

  const handleImageChange = (e) => {
    const file = e.target.files;
    if (file) {
      const urlTemporal = URL.createObjectURL(file);
      setImagenUrl(urlTemporal);
      mostrarToast('Fotografía seleccionada');
    }
  };

  const handleGuardarPublicacion = (e) => {
    e.preventDefault();

    const colorAzar = coloresPastel[Math.floor(Math.random() * coloresPastel.length)];
    const nuevoId = 'prod-' + Date.now();

    const nuevoProducto = {
      id: nuevoId,
      nombre: USUARIO_LOGUEADO,
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

    setProductos([nuevoProducto, ...productos]);
    mostrarToast('Publicación guardada');

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
        nombre: nombrePersona || productoAsociado?.nombre || USUARIO_LOGUEADO,
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

  const handleEliminarPublicacion = (productoId) => {
    if (window.confirm('¿Deseas eliminar esta publicación?')) {
      setProductos(productos.filter((p) => p.id !== productoId));
      setCarrito(carrito.filter((c) => c.id !== productoId));
      mostrarToast('Publicación eliminada');
    }
  };

  const handleFinalizarCompra = () => {
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

    setHistorialVentas([...nuevasVentasHistorial, ...historialVentas]);
    setCarrito([]);
    setVerCarrito(false);
    mostrarToast('Compra finalizada');
  };

  const ciudadesDisponibles = ['Todos', ...new Set(productos.map((p) => p.ciudad).filter(Boolean))];

  const productosFiltrados = productos.filter((p) => {
    const tituloProducto = p.nombreArticulo || p.nombre;
    const cumpleCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    const cumpleCiudad = filtroCiudad === 'Todos' || p.ciudad.toLowerCase() === filtroCiudad.toLowerCase();
    const cumpleBusqueda = !busqueda || tituloProducto.toLowerCase().includes(busqueda.toLowerCase()) || p.emprendimiento.toLowerCase().includes(busqueda.toLowerCase()) || p.ciudad.toLowerCase().includes(busqueda.toLowerCase());
    return cumpleCategoria && cumpleCiudad && cumpleBusqueda;
  });

  const totalCarrito = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="mkt-page-wrapper">
      <header className="mkt-main-header">
        <span className="mkt-vinculo">Vinculación Comercial</span>
        <h1>Marketplace de emprendedoras</h1>
        <p>Un catálogo para publicar, buscar y consultar productos o servicios ofrecidos por mujeres emprendedoras.</p>
      </header>

      <div className="mkt-container">
        <aside className="mkt-sidebar">
          <form className="mkt-form-card" onSubmit={handleGuardarPublicacion}>
            <h4>Publicación Rápida</h4>
            <p>Sube tu producto o servicio</p>

            <label>Nombre de la Vendedora (Tu Perfil)</label>
            <input type="text" value={USUARIO_LOGUEADO} readOnly style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed', color: '#64748b' }} />

            <label>Nombre de tu Marca o Tienda</label>
            <input type="text" placeholder="Ej. Vacabonita" value={emprendimiento} onChange={(e) => setEmprendimiento(e.target.value)} required />

            <label>Nombre del Artículo</label>
            <input type="text" placeholder="Ej. Pulseras artesanales" value={nombreArticulo} onChange={(e) => setNombreArticulo(e.target.value)} required />

            <label>Imagen del producto</label>
            <div className="mkt-file-upload">
              <input type="file" accept="image/*" onChange={handleImageChange} id="file-input" />
              <label htmlFor="file-input" className="file-label">Seleccionar archivo</label>
            </div>

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

          <div className="mkt-product-grid">
            {productosFiltrados.length === 0 ? (
              <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#64748b', padding: '40px' }}>No se encontraron productos que coincidan con la búsqueda.</p>
            ) : (
              productosFiltrados.map((p) => {
                const agotado = p.stock <= 0;
                const tituloCard = p.nombreArticulo || p.nombre;
                const esPropio = p.emprendimiento !== 'Carmen' && p.emprendimiento !== 'Lucía' && p.emprendimiento !== 'Marta';

                return (
                  <article className="mkt-product-card" key={p.id}>
                    {esPropio && (
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
                      <h3 className="mkt-product-title">{tituloCard}</h3>

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
              })
            )}
          </div>
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
