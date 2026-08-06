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
    const [users] = await pool.query('SELECT id, nombre, correo FROM usuarios LIMIT 1');
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('No existe ningún usuario en la base de datos. Crea un usuario primero.');
    }

    const usuarioId = users[0].id;
    const productos = [
      {
        usuario_id: usuarioId,
        nombre_articulo: 'Set de pulseras tejidas',
        emprendimiento: 'Manos Creativas',
        categoria: 'Artesanías',
        precio: 220.00,
        ciudad: 'Oaxaca',
        contacto: '5512345678',
        descripcion: 'Pulseras hechas a mano con diseños coloridos y materiales locales.',
        stock: 10,
        imagen: null,
        estado: 'publicado',
      },
      {
        usuario_id: usuarioId,
        nombre_articulo: 'Kit de velas aromáticas',
        emprendimiento: 'Luz y Aroma',
        categoria: 'Hogar',
        precio: 175.00,
        ciudad: 'CDMX',
        contacto: '5598765432',
        descripcion: 'Velas artesanales con esencias de lavanda, jazmín y naranja.',
        stock: 8,
        imagen: null,
        estado: 'publicado',
      },
      {
        usuario_id: usuarioId,
        nombre_articulo: 'Accesorios reutilizables',
        emprendimiento: 'EcoChic',
        categoria: 'Moda',
        precio: 145.00,
        ciudad: 'Puebla',
        contacto: '5588554433',
        descripcion: 'Bolsa y porta cubrebocas de tela ecológica, listos para regalar.',
        stock: 12,
        imagen: null,
        estado: 'publicado',
      },
    ];

    const results = [];
    for (const producto of productos) {
      const [result] = await pool.query(
        `INSERT INTO marketplace_productos (usuario_id, nombre_articulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          producto.usuario_id,
          producto.nombre_articulo,
          producto.emprendimiento,
          producto.categoria,
          producto.precio,
          producto.ciudad,
          producto.contacto,
          producto.descripcion,
          producto.stock,
          producto.imagen,
          producto.estado,
        ]
      );
      const [row] = await pool.query('SELECT * FROM marketplace_productos WHERE id = ? LIMIT 1', [result.insertId]);
      results.push(row[0]);
    }

    console.log('Productos insertados correctamente:', results.length);
    console.table(results.map(({ id, nombre_articulo, emprendimiento, categoria, precio, stock, estado }) => ({ id, nombre_articulo, emprendimiento, categoria, precio, stock, estado })));
  } catch (error) {
    console.error('Error insertando productos de prueba:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();