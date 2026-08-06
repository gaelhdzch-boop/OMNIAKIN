-- Script para crear la base de datos y tabla de usuarios
-- Ejecutar este archivo en MySQL antes de iniciar el backend

CREATE DATABASE IF NOT EXISTS plataforma_db;
USE plataforma_db;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  foto_perfil LONGTEXT DEFAULT NULL,
  pregunta_seguridad VARCHAR(255) DEFAULT NULL,
  respuesta_seguridad VARCHAR(255) DEFAULT NULL,
  rol ENUM('usuario', 'admin') DEFAULT 'usuario',
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_correo (correo),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tokens de Recuperación de Contraseña
CREATE TABLE IF NOT EXISTS tokens_recuperacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  fecha_expiracion DATETIME NOT NULL,
  usado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Sesiones (opcional, para auditoría)
CREATE TABLE IF NOT EXISTS sesiones (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token_jwt VARCHAR(500) NOT NULL,
  fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion DATETIME NOT NULL,
  ip_direccion VARCHAR(45),
  user_agent VARCHAR(255),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_usuario_id (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de cursos inscritos por usuario
CREATE TABLE IF NOT EXISTS cursos_usuario (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  curso_id VARCHAR(100) NOT NULL,
  progreso INT NOT NULL DEFAULT 0,
  estado ENUM('inscrito', 'completado') DEFAULT 'inscrito',
  fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_usuario_curso (usuario_id, curso_id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_curso_id (curso_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de productos del marketplace
CREATE TABLE IF NOT EXISTS marketplace_productos (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de movimientos financieros por usuario
CREATE TABLE IF NOT EXISTS finanzas_movimientos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  categoria ENUM('Ingresos', 'Gastos') NOT NULL,
  monto DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fecha VARCHAR(50) NOT NULL DEFAULT 'Hoy',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_finanzas_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de metas financieras por usuario
CREATE TABLE IF NOT EXISTS finanzas_metas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  actual DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  objetivo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  color VARCHAR(50) DEFAULT 'rosa',
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  UNIQUE KEY uq_usuario_meta (usuario_id, nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
