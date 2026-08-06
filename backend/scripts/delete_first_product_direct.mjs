import { deleteMarketplaceProductAsAdmin } from '../models/userModel.js';
import pool from '../config/database.js';

const run = async () => {
  try {
    const [rows] = await pool.query('SELECT id, nombre_articulo FROM marketplace_productos LIMIT 1');
    if (!rows || rows.length === 0) {
      console.log('No hay productos en marketplace para eliminar.');
      process.exit(0);
    }
    const id = rows[0].id;
    console.log('Intentando eliminar producto id=', id, 'nombre=', rows[0].nombre_articulo);
    const deleted = await deleteMarketplaceProductAsAdmin(id);
    console.log('Eliminado:', deleted);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
};

run();
