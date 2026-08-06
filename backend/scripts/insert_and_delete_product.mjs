import pool from '../config/database.js';
import { deleteMarketplaceProductAsAdmin } from '../models/userModel.js';

const run = async () => {
  try {
    // Insert a test product
    const [result] = await pool.query(
      `INSERT INTO marketplace_productos (usuario_id, nombre_articulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, estado)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [1, 'Producto de prueba', 'Mi Emprendimiento', 'general', 100.00, 'Ciudad', 'contacto@test.local', 'Descripción de prueba', 5, 'publicado']
    );

    const insertId = result.insertId;
    console.log('Producto insertado con id=', insertId);

    // Verify it exists
    const [rows] = await pool.query('SELECT id, nombre_articulo FROM marketplace_productos WHERE id = ?', [insertId]);
    console.log('Verificado en DB:', rows[0]);

    // Delete using admin function
    const deleted = await deleteMarketplaceProductAsAdmin(insertId);
    console.log('Deleted via admin function:', deleted);

    // Verify deletion
    const [rowsAfter] = await pool.query('SELECT id FROM marketplace_productos WHERE id = ?', [insertId]);
    console.log('Exists after delete:', rowsAfter.length > 0);

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
};

run();
