import pool from './config/database.js';

const seedCourses = [
  {
    titulo: 'Emprende desde cero',
    descripcion: 'Define tu idea, identifica a tus clientas y prepara una primera oferta lista para vender.',
    categoria: 'Emprendimiento',
    nivel: 'Básico',
    instructor: 'Ana Martínez',
    duracion: '6 horas',
    recursos: ['Validar tu idea', 'Ordenar precios base', 'Preparar una oferta simple'],
    precio: 199,
  },
  {
    titulo: 'Ventas por redes sociales',
    descripcion: 'Aprende a mostrar productos, escribir mensajes de venta y responder dudas sin perder tiempo.',
    categoria: 'Digital',
    nivel: 'Intermedio',
    instructor: 'Lucía Gómez',
    duracion: '5 horas',
    recursos: ['Crear contenido claro', 'Responder objeciones', 'Medir publicaciones'],
    precio: 249,
  },
  {
    titulo: 'Finanzas para mi negocio',
    descripcion: 'Organiza ingresos, gastos, precios y metas para tomar mejores decisiones cada semana.',
    categoria: 'Finanzas',
    nivel: 'Básico',
    instructor: 'Mariana Pérez',
    duracion: '7 horas',
    recursos: ['Separar finanzas', 'Calcular utilidad', 'Definir metas semanales'],
    precio: 299,
  },
];

const seedOpportunities = [
  {
    titulo: 'Programa de financiamiento para emprendedoras',
    organizacion: 'Secretaría de Economía',
    categoria: 'apoyo-economico',
    estado: 'Nacional',
    descripcion: 'Acceso a capital semilla y acompañamiento para fortalecer negocios con impacto social.',
    monto: '$50,000 MXN aprox.',
    ciudad: 'Nacional',
    contacto: 'contacto@economia.gob.mx',
    requisitos: ['Ser mujer emprendedora', 'Negocio en operación', 'Identificación oficial'],
    estado_publicacion: 'Abierta',
  },
  {
    titulo: 'Beca de formación digital para mujeres',
    organizacion: 'Fundación Pro Mujer',
    categoria: 'becas',
    estado: 'CDMX',
    descripcion: 'Capacitación en ventas digitales, marketing y herramientas de productividad.',
    monto: 'Curso gratuito',
    ciudad: 'CDMX',
    contacto: 'info@promujer.org',
    requisitos: ['Mujer de 18 a 35 años', 'Interés en emprendimiento', 'Registro previo'],
    estado_publicacion: 'Próxima',
  },
  {
    titulo: 'Convocatoria de mentorías empresariales',
    organizacion: 'Instituto Nacional de las Mujeres',
    categoria: 'empleos',
    estado: 'Edoméx',
    descripcion: 'Mentoría personalizada para escalar servicios y productos con enfoque femenino.',
    monto: 'Mentoría sin costo',
    ciudad: 'Edoméx',
    contacto: 'contacto@inmujeres.gob.mx',
    requisitos: ['Emprendimiento formal o informal', 'Disposición a sesiones', 'Plan de negocio básico'],
    estado_publicacion: 'Abierta',
  },
  {
    titulo: 'Apoyo para vivienda y crecimiento empresarial',
    organizacion: 'Programa Mujer y Empresa',
    categoria: 'vivienda',
    estado: 'Puebla',
    descripcion: 'Apoyos para fortalecer infraestructura y operación del negocio desde la vivienda.',
    monto: 'Apoyo parcial',
    ciudad: 'Puebla',
    contacto: 'info@mujeryempresa.org',
    requisitos: ['Mujer emprendedora', 'Residencia local', 'Comprobante de negocio'],
    estado_publicacion: 'Abierta',
  },
];

const insertarDatosIniciales = async () => {
  const [[{ cursosCount }]] = await pool.query('SELECT COUNT(*) AS cursosCount FROM cursos');
  if (cursosCount === 0) {
    for (const course of seedCourses) {
      await pool.query(
        'INSERT INTO cursos (titulo, descripcion, categoria, nivel, instructor, duracion, recursos, precio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [course.titulo, course.descripcion, course.categoria, course.nivel, course.instructor, course.duracion, JSON.stringify(course.recursos), Number(course.precio)]
      );
    }
  }

  const [[{ oportunidadesCount }]] = await pool.query('SELECT COUNT(*) AS oportunidadesCount FROM oportunidades');
  if (oportunidadesCount === 0) {
    for (const opportunity of seedOpportunities) {
      await pool.query(
        'INSERT INTO oportunidades (titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, requisitos, estado_publicacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [opportunity.titulo, opportunity.organizacion, opportunity.categoria, opportunity.estado, opportunity.descripcion, opportunity.monto, opportunity.ciudad, opportunity.contacto, JSON.stringify(opportunity.requisitos), opportunity.estado_publicacion]
      );
    }
  }
};

const crearTablasFinanzas = async () => {
  const queries = [
    `CREATE TABLE IF NOT EXISTS marketplace_productos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      usuario_id INT NOT NULL,
      nombre_articulo VARCHAR(255) NOT NULL,
      emprendimiento VARCHAR(255) NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      ciudad VARCHAR(100) DEFAULT NULL,
      contacto VARCHAR(100) DEFAULT NULL,
      descripcion TEXT DEFAULT NULL,
      stock INT NOT NULL DEFAULT 0,
      imagen LONGTEXT DEFAULT NULL,
      estado ENUM('publicado', 'vendido', 'inactivo') DEFAULT 'publicado',
      fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_usuario_id (usuario_id),
      INDEX idx_categoria (categoria),
      INDEX idx_ciudad (ciudad)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS cursos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      titulo VARCHAR(255) NOT NULL,
      descripcion TEXT DEFAULT NULL,
      categoria VARCHAR(100) NOT NULL,
      nivel VARCHAR(100) DEFAULT 'Básico',
      instructor VARCHAR(255) DEFAULT NULL,
      duracion VARCHAR(100) DEFAULT NULL,
      recursos JSON DEFAULT NULL,
      precio DECIMAL(10,2) DEFAULT 0.00,
      estado ENUM('activo', 'inactivo') DEFAULT 'activo',
      fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS oportunidades (
      id INT PRIMARY KEY AUTO_INCREMENT,
      titulo VARCHAR(255) NOT NULL,
      organizacion VARCHAR(255) NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      estado VARCHAR(50) NOT NULL,
      descripcion TEXT NOT NULL,
      monto VARCHAR(100) DEFAULT NULL,
      ciudad VARCHAR(100) DEFAULT NULL,
      contacto VARCHAR(100) DEFAULT NULL,
      requisitos JSON DEFAULT NULL,
      fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      estado_publicacion ENUM('Abierta', 'Próxima', 'Cerrada') DEFAULT 'Abierta'
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS finanzas_movimientos (
      id INT PRIMARY KEY AUTO_INCREMENT,
      usuario_id INT NOT NULL,
      concepto VARCHAR(255) NOT NULL,
      categoria ENUM('Ingresos', 'Gastos') NOT NULL,
      monto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      fecha VARCHAR(50) NOT NULL DEFAULT 'Hoy',
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_finanzas_usuario (usuario_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS finanzas_metas (
      id INT PRIMARY KEY AUTO_INCREMENT,
      usuario_id INT NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      actual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      objetivo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      color VARCHAR(50) DEFAULT 'rosa',
      fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      UNIQUE KEY uq_usuario_meta (usuario_id, nombre)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS comunidad_posts (
      id INT PRIMARY KEY AUTO_INCREMENT,
      usuario_id INT NOT NULL,
      categoria VARCHAR(100) NOT NULL,
      titulo VARCHAR(255) NOT NULL,
      texto TEXT NOT NULL,
      fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_comunidad_usuario (usuario_id),
      INDEX idx_comunidad_categoria (categoria)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS comunidad_comments (
      id INT PRIMARY KEY AUTO_INCREMENT,
      post_id INT NOT NULL,
      usuario_id INT NOT NULL,
      texto TEXT NOT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES comunidad_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      INDEX idx_comunidad_post (post_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS comunidad_reacciones (
      id INT PRIMARY KEY AUTO_INCREMENT,
      usuario_id INT NOT NULL,
      post_id INT NOT NULL,
      tipo ENUM('like') DEFAULT 'like',
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES comunidad_posts(id) ON DELETE CASCADE,
      UNIQUE KEY uq_usuario_post_tipo (usuario_id, post_id, tipo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const query of queries) {
    await pool.query(query);
  }
};

const conectarDB = async () => {
  await pool.query('SELECT 1');
  await crearTablasFinanzas();
  await insertarDatosIniciales();
  console.log('Conexión a MySQL lista y tablas de finanzas verificadas.');
};

export default conectarDB;
