import fetch from 'node-fetch';
import pool from './config/database.js';

(async () => {
  try {
    console.log('DB CONNECT');
    const [dbRows] = await pool.query('SELECT 1 AS ok');
    console.log('DB ROWS', dbRows);
  } catch (error) {
    console.error('DB ERROR', error.message);
  }

  try {
    console.log('LOGIN');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'test@example.com', contraseña: 'TestPass123!' })
    });
    const loginData = await loginRes.json();
    console.log('LOGIN', loginRes.status, loginData);
    if (!loginData.token) return;
    const token = loginData.token;

    const productsRes = await fetch('http://localhost:5000/api/auth/marketplace', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const productsData = await productsRes.json();
    console.log('PRODUCTOS', productsRes.status, productsData);

    const productos = productsData.products || productsData;
    const item = productos[0];
    if (!item) {
      console.log('No hay producto en backend.');
      return;
    }

    const purchaseRes = await fetch('http://localhost:5000/api/auth/marketplace/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ items: [{ productoId: item.id, cantidad: 1, monto: Number(item.precio) || 0, sellerId: item.usuario_id || item.user_id || null, nombreArticulo: item.nombre_articulo || item.nombre, fecha: 'Hoy' }] })
    });
    const purchaseData = await purchaseRes.json();
    console.log('PURCHASE', purchaseRes.status, purchaseData);

    const finanzasRes = await fetch('http://localhost:5000/api/auth/finanzas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const finanzasData = await finanzasRes.json();
    console.log('FINANZAS', finanzasRes.status, finanzasData);
  } catch (error) {
    console.error('ERROR', error);
  } finally {
    pool.end();
  }
})();
