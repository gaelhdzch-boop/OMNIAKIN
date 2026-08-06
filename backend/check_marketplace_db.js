import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'plataforma_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const main = async () => {
  try {
    const [rows] = await pool.query('SELECT id, nombre_articulo, emprendimiento, categoria, estado, stock, usuario_id FROM marketplace_productos LIMIT 50');
    console.log('RESULT_COUNT', rows.length);
    console.table(rows);
  } catch (error) {
    console.error('ERROR', error.message);
  } finally {
    await pool.end();
  }
};

main();