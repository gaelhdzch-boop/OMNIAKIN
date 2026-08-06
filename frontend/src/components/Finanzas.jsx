import { useEffect, useMemo, useState } from 'react';
import { authService } from '../services/api';
import '../styles/Finanzas.css';

const movimientosIniciales = [];

const metasIniciales = [
  {
    nombre: 'Comprar inventario',
    actual: 0,
    objetivo: 0,
    color: 'rosa',
  },
  {
    nombre: 'Fondo de emergencia',
    actual: 0,
    objetivo: 0,
    color: 'verde',
  },
  {
    nombre: 'Publicidad del mes',
    actual: 0,
    objetivo: 0,
    color: 'amarillo',
  },
];

const formatoMoneda = new Intl.NumberFormat('es-MX', {
  currency: 'MXN',
  maximumFractionDigits: 0,
  style: 'currency',
});

const formularioVacio = {
  concepto: '',
  categoria: 'Ingresos',
  monto: '',
};

export default function Finanzas() {
  const [movimientos, setMovimientos] = useState(movimientosIniciales);
  const [formulario, setFormulario] = useState(formularioVacio);
  const [costo, setCosto] = useState(0);
  const [margen, setMargen] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [metas, setMetas] = useState(metasIniciales);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const resumen = useMemo(() => {
    const ingresos = movimientos
      .filter((movimiento) => movimiento.categoria === 'Ingresos')
      .reduce((total, movimiento) => total + movimiento.monto, 0);
    const gastos = movimientos
      .filter((movimiento) => movimiento.categoria === 'Gastos')
      .reduce((total, movimiento) => total + movimiento.monto, 0);

    return {
      gastos,
      ingresos,
      utilidad: ingresos - gastos,
      porcentajeGasto: ingresos ? Math.min(Math.round((gastos / ingresos) * 100), 100) : 0,
    };
  }, [movimientos]);

  const precioSugerido = useMemo(() => {
    const costoNumero = Number(costo) || 0;
    const margenNumero = Number(margen) || 0;

    return costoNumero + costoNumero * (margenNumero / 100);
  }, [costo, margen]);

  const cargarFinanzas = async () => {
    try {
      setCargando(true);
      const data = await authService.getFinanzas();
      const movimientosPersistidos = Array.isArray(data?.movimientos) ? data.movimientos : [];
      const metasPersistidas = Array.isArray(data?.metas) && data.metas.length
        ? data.metas
        : metasIniciales;

      setMovimientos(movimientosPersistidos);
      setMetas(metasPersistidas);
    } catch (error) {
      console.error('No se pudieron cargar las finanzas:', error);
      setMensaje(error.message || 'No se pudieron cargar tus finanzas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarFinanzas();
  }, []);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setCargando(false);
      return;
    }

    const onFinanzasActualizadas = () => cargarFinanzas();
    window.addEventListener('finanzasActualizadas', onFinanzasActualizadas);
    return () => window.removeEventListener('finanzasActualizadas', onFinanzasActualizadas);
  }, []);

  const guardarMetas = async (metasToSave) => {
    try {
      setGuardando(true);
      await authService.updateFinanzasMetas(metasToSave);
      setMensaje('Metas guardadas correctamente.');
    } catch (error) {
      console.error('No se pudieron guardar las metas:', error);
      setMensaje(error.message || 'No se pudieron guardar las metas.');
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje(''), 3000);
    }
  };

  const actualizarMeta = (index, campo, valor) => {
    setMetas((actuales) =>
      actuales.map((meta, i) =>
        i === index ? { ...meta, [campo]: Number(valor) || 0 } : meta
      )
    );
  };

  const actualizarCampo = (evento) => {
    const { name, value } = evento.target;
    setFormulario((actual) => ({ ...actual, [name]: value }));
  };

  const registrarMovimiento = async (evento) => {
    evento.preventDefault();

    const monto = Number(formulario.monto);

    if (!formulario.concepto.trim() || !monto || monto <= 0) {
      setMensaje('Agrega un concepto y un monto valido.');
      return;
    }

    try {
      const movimiento = await authService.createFinanzasMovimiento({
        concepto: formulario.concepto.trim(),
        categoria: formulario.categoria,
        monto,
        fecha: 'Hoy',
      });

      setMovimientos((actuales) => [movimiento.movimiento, ...actuales]);
      setFormulario(formularioVacio);
      setMensaje('Movimiento agregado al resumen financiero.');
    } catch (error) {
      console.error('No se pudo guardar el movimiento:', error);
      setMensaje(error.message || 'No se pudo guardar el movimiento.');
    }
  };

  return (
    <section className="finanzas-section" id="finanzas" aria-labelledby="finanzas-title">
      <div className="section-header finanzas-header">
        <span className="section-kicker">Control financiero</span>
        <h2 id="finanzas-title" className="section-title">Finanzas simples para tomar mejores decisiones</h2>
        <p className="section-copy">
          Registra ingresos y gastos, revisa tu utilidad, calcula precios y sigue metas de ahorro
          para que tu negocio tenga numeros claros cada semana.
        </p>
      </div>

      <div className="finanzas-summary" aria-label="Resumen financiero">
        <article>
          <span>Ingresos</span>
          <strong>{formatoMoneda.format(resumen.ingresos)}</strong>
        </article>
        <article>
          <span>Gastos</span>
          <strong>{formatoMoneda.format(resumen.gastos)}</strong>
        </article>
        <article>
          <span>Utilidad estimada</span>
          <strong>{formatoMoneda.format(resumen.utilidad)}</strong>
        </article>
      </div>

      <div className="finanzas-layout">
        <div className="finanzas-main">
          <article className="finanzas-panel finanzas-balance">
            <div className="finanzas-panel-title">
              <span>Balance mensual</span>
              <strong>{resumen.porcentajeGasto}% en gastos</strong>
            </div>
            <div className="finanzas-bar" aria-label={`Gastos equivalen al ${resumen.porcentajeGasto}%`}>
              <span style={{ width: `${resumen.porcentajeGasto}%` }} />
            </div>
            <p>
              Mantener los gastos visibles ayuda a separar dinero personal, reinversion e ingreso
              disponible.
            </p>
          </article>

          <article className="finanzas-panel">
            <div className="finanzas-panel-title">
              <span>Movimientos recientes</span>
              <strong>
                {movimientos.length} {movimientos.length === 1 ? 'registro' : 'registros'}
              </strong>
            </div>

            {cargando ? (
              <p className="finanzas-message">Cargando tus finanzas...</p>
            ) : (
            <div className="finanzas-table" role="table" aria-label="Movimientos financieros">
              <div className="finanzas-row finanzas-row-head" role="row">
                <span>Concepto</span>
                <span>Tipo</span>
                <span>Monto</span>
              </div>
              {movimientos.slice(0, 6).map((movimiento) => (
                <div className="finanzas-row" key={movimiento.id} role="row">
                  <div>
                    <strong>{movimiento.concepto}</strong>
                    <small>{movimiento.fecha}</small>
                  </div>
                  <span className={movimiento.categoria === 'Ingresos' ? 'tag-income' : 'tag-expense'}>
                    {movimiento.categoria}
                  </span>
                  <strong>{formatoMoneda.format(movimiento.monto)}</strong>
                </div>
              ))}
              {!movimientos.length && (
                <div className="finanzas-empty" role="row">
                  <strong>Sin movimientos registrados</strong>
                  <span>Aquí aparecerán tus ingresos y gastos guardados por cuenta.</span>
                </div>
              )}
            </div>
            )}
          </article>
        </div>

        <aside className="finanzas-side">
          <article className="finanzas-panel">
            <div className="finanzas-panel-title">
              <span>Nuevo movimiento</span>
              <strong>Rapido</strong>
            </div>

            <form className="finanzas-form" onSubmit={registrarMovimiento}>
              <label>
                Concepto
                <input
                  name="concepto"
                  onChange={actualizarCampo}
                  placeholder="Ej. Venta, insumos, envio"
                  type="text"
                  value={formulario.concepto}
                />
              </label>
              <label>
                Tipo
                <select name="categoria" onChange={actualizarCampo} value={formulario.categoria}>
                  <option>Ingresos</option>
                  <option>Gastos</option>
                </select>
              </label>
              <label>
                Monto
                <input
                  min="1"
                  name="monto"
                  onChange={actualizarCampo}
                  placeholder="Ej. 850"
                  type="number"
                  value={formulario.monto}
                />
              </label>
              <button type="submit">Agregar movimiento</button>
            </form>
            {mensaje && <p className="finanzas-message">{mensaje}</p>}
            {guardando && <p className="finanzas-message">Guardando cambios...</p>}
          </article>

          <article className="finanzas-panel">
            <div className="finanzas-panel-title">
              <span>Calculadora de precio</span>
              <strong>{formatoMoneda.format(precioSugerido)}</strong>
            </div>

            <div className="finanzas-calculator">
              <label>
                Costo por pieza
                <input
                  min="0"
                  onChange={(evento) => setCosto(evento.target.value)}
                  type="number"
                  value={costo}
                />
              </label>
              <label>
                Margen deseado
                <input
                  max="200"
                  min="0"
                  onChange={(evento) => setMargen(evento.target.value)}
                  type="range"
                  value={margen}
                />
                <span>{margen}%</span>
              </label>
            </div>
          </article>
        </aside>
      </div>

      <div className="finanzas-goals" aria-label="Metas financieras">
        {metas.map((meta, index) => {
          const avance = meta.objetivo
            ? Math.min(Math.round((meta.actual / meta.objetivo) * 100), 100)
            : 0;

          return (
            <article className={`finanzas-goal finanzas-goal-${meta.color}`} key={meta.nombre}>
              <div>
                <span>{meta.nombre}</span>
                <strong>{avance}%</strong>
              </div>
              <div className="finanzas-goal-bar">
                <span style={{ width: `${avance}%` }} />
              </div>
              <div className="finanzas-goal-inputs">
                <label>
                  Meta
                  <input
                    min="0"
                    name="objetivo"
                    type="number"
                    value={meta.objetivo}
                    onChange={(e) => actualizarMeta(index, 'objetivo', e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
                <label>
                  Ahorrado
                  <input
                    min="0"
                    name="actual"
                    type="number"
                    value={meta.actual}
                    onChange={(e) => actualizarMeta(index, 'actual', e.target.value)}
                    onFocus={(e) => e.target.select()}
                  />
                </label>
              </div>
              <p>
                {meta.actual > 0
                  ? `Has alcanzado ${avance}% de esta meta.`
                  : 'Agrega el objetivo y lo que ya llevas ahorrado para ver el avance.'}
              </p>
              <p>
                {formatoMoneda.format(meta.actual)} de {formatoMoneda.format(meta.objetivo)}
              </p>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => guardarMetas(metas)}
                  disabled={guardando}
                  className="btn-guardar-meta"
                >
                  {guardando ? 'Guardando...' : 'Guardar meta'}
                </button>
                <button
                  type="button"
                  onClick={() => guardarMetas(metas)}
                  disabled={guardando}
                  className="btn-guardar-meta"
                >
                  {guardando ? 'Guardando...' : 'Guardar ahorrado'}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
