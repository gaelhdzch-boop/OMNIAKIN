import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getUserByEmail,
  createUser,
  getUserById,
  getUserWithPasswordById,
  updateUserPassword,
  updateUserProfile,
  updateUserSecurityQuestion,
  getAllUsers,
  updateUserRole,
  createPasswordResetToken,
  getPasswordResetByToken,
  markPasswordResetTokenUsed,
  getUserCourseProgress,
  registerUserCourse,
  updateUserCourseProgress,
  getMarketplaceProducts,
  createMarketplaceProduct,
  updateMarketplaceProductStock,
  updateMarketplaceProductStockAsAdmin,
  updateMarketplaceProductAsAdmin,
  deleteMarketplaceProduct,
  deleteMarketplaceProductAsAdmin,
  getMarketplaceProductById,
  decrementMarketplaceProductStock,
  getFinanzasMovimientos,
  createFinanzasMovimiento,
  getFinanzasMetas,
  saveFinanzasMetas,
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../models/userModel.js';

const JWT_SECRET = process.env.JWT_SECRET;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// RF-1.1: Registro
export const register = async (req, res) => {
  try {
    const { nombre, preguntaSeguridad, respuestaSeguridad } = req.body;
    let { correo, contraseña, confirmarContraseña } = req.body;
    if (typeof correo === 'string') correo = correo.trim();
    if (typeof contraseña === 'string') contraseña = contraseña.normalize('NFC').trim();
    if (typeof confirmarContraseña === 'string') confirmarContraseña = confirmarContraseña.normalize('NFC').trim();
    const preguntaSegura = typeof preguntaSeguridad === 'string' ? preguntaSeguridad.trim() : '';
    const respuestaSegura = typeof respuestaSeguridad === 'string' ? respuestaSeguridad.trim() : '';

    // Validaciones
    if (!nombre || !correo || !contraseña || !confirmarContraseña || !preguntaSegura || !respuestaSegura) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (contraseña.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    if (contraseña !== confirmarContraseña) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    if (!correo.includes('@')) {
      return res.status(400).json({ message: 'El correo debe contener "@"' });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await getUserByEmail(correo);
    if (usuarioExistente) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar contraseña con bcrypt (RNF-1)
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);

    const respuestaSeguridadHasheada = await bcrypt.hash(respuestaSegura, salt);

    // Crear usuario
    const usuarioId = await createUser(nombre, correo, contraseñaHasheada, preguntaSegura, respuestaSeguridadHasheada);

    // Generar JWT (RNF-2)
    const token = jwt.sign(
      { id: usuarioId, correo, nombre, rol: 'usuario' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Cuenta creada exitosamente',
      user: {
        id: usuarioId,
        nombre,
        correo,
        rol: 'usuario',
      },
      token,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error al crear la cuenta' });
  }
};

// RF-1.2: Inicio de Sesión
export const login = async (req, res) => {
  try {
    let { correo, contraseña } = req.body;
    if (typeof correo === 'string') correo = correo.trim();
    if (typeof contraseña === 'string') contraseña = contraseña.normalize('NFC').trim();

    // Validaciones
    if (!correo || !contraseña) {
      return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
    }

    if (!correo.includes('@')) {
      return res.status(400).json({ message: 'El correo debe contener "@"' });
    }

    if (contraseña.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    // Buscar usuario
    const usuario = await getUserByEmail(correo);
    if (!usuario) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Verificar contraseña
    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    // Generar JWT (RNF-2)
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Sesión iniciada exitosamente',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
};

// RF-1.3: Recuperación de Contraseña
export const forgotPassword = async (req, res) => {
  try {
    let { correo, respuestaSeguridad, contraseña, confirmarContraseña } = req.body;
    if (typeof correo === 'string') correo = correo.trim();
    if (typeof respuestaSeguridad === 'string') respuestaSeguridad = respuestaSeguridad.trim().normalize('NFC');
    if (typeof contraseña === 'string') contraseña = contraseña.normalize('NFC');
    if (typeof confirmarContraseña === 'string') confirmarContraseña = confirmarContraseña.normalize('NFC');

    if (!correo) {
      return res.status(400).json({ message: 'El correo es requerido' });
    }

    const usuario = await getUserByEmail(correo);
    if (!usuario || !usuario.pregunta_seguridad || !usuario.respuesta_seguridad) {
      return res.status(400).json({ message: 'No se pudo verificar la información de recuperación' });
    }

    if (!respuestaSeguridad && !contraseña && !confirmarContraseña) {
      return res.status(200).json({
        message: 'Pregunta de seguridad disponible',
        preguntaSeguridad: usuario.pregunta_seguridad,
      });
    }

    if (!respuestaSeguridad || !contraseña || !confirmarContraseña) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (contraseña.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    if (contraseña !== confirmarContraseña) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    const respuestaValida = await bcrypt.compare(respuestaSeguridad, usuario.respuesta_seguridad);
    if (!respuestaValida) {
      return res.status(401).json({ message: 'La respuesta de seguridad es incorrecta' });
    }

    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseña, salt);
    await updateUserPassword(usuario.id, contraseñaHasheada);

    res.status(200).json({
      message: 'Contraseña restablecida correctamente. Ya puedes iniciar sesión.',
    });
  } catch (error) {
    console.error('Error en recuperación:', error);
    res.status(500).json({ message: 'Error al recuperar contraseña' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.body;
    let { contraseña, confirmarContraseña } = req.body;
    if (typeof contraseña === 'string') contraseña = contraseña.normalize('NFC');
    if (typeof confirmarContraseña === 'string') confirmarContraseña = confirmarContraseña.normalize('NFC');

    if (!token || !contraseña || !confirmarContraseña) {
      return res.status(400).json({ message: 'Token y contraseñas son requeridos' });
    }

    if (contraseña.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    if (contraseña !== confirmarContraseña) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    const resetRecord = await getPasswordResetByToken(token);
    if (!resetRecord || resetRecord.usado) {
      return res.status(400).json({ message: 'Token inválido o ya utilizado' });
    }

    const expirationDate = new Date(resetRecord.fecha_expiracion);
    if (expirationDate < new Date()) {
      return res.status(400).json({ message: 'El token ha expirado' });
    }

    await updateUserPassword(resetRecord.usuario_id, await bcrypt.hash(contraseña, 10));
    await markPasswordResetTokenUsed(resetRecord.id);

    res.status(200).json({ message: 'Contraseña restablecida correctamente' });
  } catch (error) {
    console.error('Error en restablecer contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
};

// RF-1.4: Obtener Perfil
export const getProfile = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const usuario = await getUserById(usuarioId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      user: usuario,
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

// RF-1.4: Actualizar Perfil
export const updateProfile = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { nombre, fotoPerfil, preguntaSeguridad, respuestaSeguridad } = req.body;

    // Validaciones básicas
    const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
    if (fotoPerfil && typeof fotoPerfil === 'string' && fotoPerfil.startsWith('data:')) {
      const base64Part = fotoPerfil.split(',')[1] || '';
      const imageBytes = Buffer.byteLength(base64Part, 'base64');
      if (imageBytes > MAX_IMAGE_BYTES) {
        return res.status(413).json({ message: 'La imagen es más pesada de lo debido. Usa una imagen menor a 4 MB.' });
      }
    }

    let fotoPerfilToSave = fotoPerfil;
    if (fotoPerfil === undefined) {
      const usuarioActual = await getUserById(usuarioId);
      fotoPerfilToSave = usuarioActual?.foto_perfil || null;
    }

    await updateUserProfile(usuarioId, nombre, fotoPerfilToSave);

    if (preguntaSeguridad || respuestaSeguridad) {
      if (!preguntaSeguridad || !respuestaSeguridad) {
        return res.status(400).json({ message: 'Pregunta y respuesta de seguridad son requeridas.' });
      }

      const salt = await bcrypt.genSalt(10);
      const respuestaSeguridadHasheada = await bcrypt.hash(respuestaSeguridad, salt);
      await updateUserSecurityQuestion(usuarioId, preguntaSeguridad, respuestaSeguridadHasheada);
    }

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    if (error.message && error.message.includes('max_allowed_packet')) {
      return res.status(413).json({ message: 'La imagen es demasiado pesada para la base de datos. Usa una imagen más liviana.' });
    }
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

export const getFinanzasController = async (req, res) => {
  try {
    const movimientos = await getFinanzasMovimientos(req.user.id);
    const metas = await getFinanzasMetas(req.user.id);

    res.status(200).json({ movimientos, metas });
  } catch (error) {
    console.error('Error al obtener finanzas:', error);
    res.status(500).json({ message: 'Error al cargar tus finanzas' });
  }
};

export const createFinanzasMovimientoController = async (req, res) => {
  try {
    const { concepto, categoria, monto, fecha } = req.body;

    if (!concepto || !categoria || monto === undefined || monto === null) {
      return res.status(400).json({ message: 'Concepto, categoría y monto son requeridos' });
    }

    const montoNumber = Number(monto);
    if (Number.isNaN(montoNumber) || montoNumber <= 0) {
      return res.status(400).json({ message: 'El monto debe ser un número mayor a cero' });
    }

    const movimiento = await createFinanzasMovimiento(req.user.id, concepto.trim(), categoria, montoNumber, fecha || 'Hoy');

    res.status(201).json({ message: 'Movimiento agregado correctamente', movimiento });
  } catch (error) {
    console.error('Error al guardar movimiento:', error);
    res.status(500).json({ message: 'No se pudo guardar el movimiento' });
  }
};

export const updateFinanzasMetasController = async (req, res) => {
  try {
    const { metas } = req.body;

    if (!Array.isArray(metas)) {
      return res.status(400).json({ message: 'La estructura de metas es inválida' });
    }

    const metasGuardadas = await saveFinanzasMetas(req.user.id, metas);

    res.status(200).json({ message: 'Metas guardadas correctamente', metas: metasGuardadas });
  } catch (error) {
    console.error('Error al guardar metas:', error);
    res.status(500).json({ message: 'No se pudieron guardar las metas' });
  }
};

export const getMarketplaceProductsController = async (req, res) => {
  try {
    const products = await getMarketplaceProducts();
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error al obtener productos del marketplace:', error);
    res.status(500).json({ message: 'Error al obtener productos del marketplace' });
  }
};

export const createMarketplaceProductController = async (req, res) => {
  try {
    const { nombreArticulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen } = req.body;

    // Procesar imagen dataURL si viene en base64 y guardarla en /uploads/marketplace
    let imagenPathToSave = null;
    if (imagen && typeof imagen === 'string' && imagen.startsWith('data:')) {
      const matches = imagen.match(/^data:(image\/\w+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const ext = mime.split('/')[1] === 'jpeg' ? 'jpg' : mime.split('/')[1];
        const base64Data = matches[2];
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'marketplace');
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const filePath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));
        imagenPathToSave = `/uploads/marketplace/${filename}`;
      }
    } else if (imagen) {
      imagenPathToSave = imagen;
    }

    if (!nombreArticulo || !emprendimiento || !categoria || precio === undefined || precio === null || stock === undefined || stock === null) {
      return res.status(400).json({ message: 'Nombre del artículo, emprendimiento, categoría, precio y stock son requeridos' });
    }

    const precioNumber = Number(precio);
    const stockNumber = Number(stock);
    if (Number.isNaN(precioNumber) || precioNumber < 0 || Number.isNaN(stockNumber) || stockNumber < 0) {
      return res.status(400).json({ message: 'Precio y stock deben ser números válidos no negativos' });
    }

    const product = await createMarketplaceProduct(
      req.user.id,
      nombreArticulo,
      emprendimiento,
      categoria,
      precioNumber,
      ciudad || null,
      contacto || null,
      descripcion || null,
      stockNumber,
      imagenPathToSave || null
    );

    res.status(201).json({ message: 'Producto publicado correctamente', product });
  } catch (error) {
    console.error('Error al publicar producto en el marketplace:', error);
    res.status(500).json({ message: 'Error al publicar el producto' });
  }
};

export const deleteMarketplaceProductController = async (req, res) => {
  try {
    const productoId = req.params.id;

    if (!productoId) {
      return res.status(400).json({ message: 'ID del producto es requerido' });
    }

    const deleted = req.user.rol === 'admin'
      ? await deleteMarketplaceProductAsAdmin(productoId)
      : await deleteMarketplaceProduct(req.user.id, productoId);

    if (!deleted) {
      return res.status(404).json({ message: 'Producto no encontrado o no tienes permisos para eliminarlo' });
    }

    res.status(200).json({ message: 'Publicación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto del marketplace:', error);
    res.status(500).json({ message: 'Error al eliminar el producto' });
  }
};

export const updateMarketplaceProductStockController = async (req, res) => {
  try {
    const productoId = req.params.id;
    const { stock } = req.body;

    if (!productoId || stock === undefined || stock === null) {
      return res.status(400).json({ message: 'ID del producto y stock son requeridos' });
    }

    const stockNumber = Number(stock);
    if (Number.isNaN(stockNumber) || stockNumber < 0) {
      return res.status(400).json({ message: 'Stock debe ser un número válido no negativo' });
    }

    const product = req.user.rol === 'admin'
      ? await updateMarketplaceProductStockAsAdmin(productoId, stockNumber)
      : await updateMarketplaceProductStock(req.user.id, productoId, stockNumber);

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado o no tienes permisos para editarlo' });
    }

    res.status(200).json({ message: 'Stock actualizado correctamente', product });
  } catch (error) {
    console.error('Error al actualizar stock del marketplace:', error);
    res.status(500).json({ message: 'Error al actualizar el stock del producto' });
  }
};

export const updateMarketplaceProductController = async (req, res) => {
  try {
    const productoId = req.params.id;
    const { nombreArticulo, emprendimiento, categoria, precio, ciudad, contacto, descripcion, stock, imagen } = req.body;

    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No tienes permisos para modificar este producto' });
    }

    if (!productoId) {
      return res.status(400).json({ message: 'ID del producto es requerido' });
    }

    const precioNumber = precio !== undefined && precio !== null ? Number(precio) : null;
    const stockNumber = stock !== undefined && stock !== null ? Number(stock) : null;

    if (precioNumber !== null && (Number.isNaN(precioNumber) || precioNumber < 0)) {
      return res.status(400).json({ message: 'Precio debe ser un número válido no negativo' });
    }
    if (stockNumber !== null && (Number.isNaN(stockNumber) || stockNumber < 0)) {
      return res.status(400).json({ message: 'Stock debe ser un número válido no negativo' });
    }

    const product = await updateMarketplaceProductAsAdmin(
      productoId,
      nombreArticulo,
      emprendimiento,
      categoria,
      precioNumber,
      ciudad || null,
      contacto || null,
      descripcion || null,
      stockNumber,
      imagen || null
    );

    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto actualizado correctamente', product });
  } catch (error) {
    console.error('Error al actualizar producto del marketplace:', error);
    res.status(500).json({ message: 'Error al actualizar el producto' });
  }
};

export const listCoursesController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }
    const courses = await getCourses();
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error al listar cursos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos' });
  }
};

export const listCoursesPublicController = async (req, res) => {
  try {
    const courses = await getCourses();
    res.status(200).json({ courses });
  } catch (error) {
    console.error('Error al listar cursos públicos:', error);
    res.status(500).json({ message: 'Error al obtener los cursos' });
  }
};

export const createCourseController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const { titulo, descripcion, categoria, nivel, instructor, duracion, recursos, precio } = req.body;
    if (!titulo || !categoria) {
      return res.status(400).json({ message: 'Título y categoría son requeridos' });
    }

    const course = await createCourse(
      titulo,
      descripcion || '',
      categoria,
      nivel || 'Básico',
      instructor || '',
      duracion || '',
      Array.isArray(recursos) ? recursos : [],
      Number(precio || 0)
    );
    res.status(201).json({ message: 'Curso creado correctamente', course });
  } catch (error) {
    console.error('Error al crear curso:', error);
    res.status(500).json({ message: 'Error al crear el curso' });
  }
};

export const updateCourseController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const courseId = req.params.id;
    const { titulo, descripcion, categoria, nivel, instructor, duracion, recursos, precio, estado } = req.body;
    if (!courseId || !titulo || !categoria) {
      return res.status(400).json({ message: 'ID, título y categoría son requeridos' });
    }

    const course = await updateCourse(
      courseId,
      titulo,
      descripcion || '',
      categoria,
      nivel || 'Básico',
      instructor || '',
      duracion || '',
      Array.isArray(recursos) ? recursos : [],
      Number(precio || 0),
      estado || 'activo'
    );

    if (!course) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    res.status(200).json({ message: 'Curso actualizado correctamente', course });
  } catch (error) {
    console.error('Error al actualizar curso:', error);
    res.status(500).json({ message: 'Error al actualizar el curso' });
  }
};

export const deleteCourseController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const courseId = req.params.id;
    if (!courseId) {
      return res.status(400).json({ message: 'ID del curso es requerido' });
    }

    const deleted = await deleteCourse(courseId);
    if (!deleted) {
      return res.status(404).json({ message: 'Curso no encontrado' });
    }

    res.status(200).json({ message: 'Curso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar curso:', error);
    res.status(500).json({ message: 'Error al eliminar el curso' });
  }
};

export const listOpportunitiesController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }
    const opportunities = await getOpportunities();
    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error al listar oportunidades:', error);
    res.status(500).json({ message: 'Error al obtener las oportunidades' });
  }
};

export const listOpportunitiesPublicController = async (req, res) => {
  try {
    const opportunities = await getOpportunities();
    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error al listar oportunidades públicas:', error);
    res.status(500).json({ message: 'Error al obtener las oportunidades' });
  }
};

export const createOpportunityController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const { titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, requisitos } = req.body;
    if (!titulo || !organizacion || !categoria || !estado || !descripcion) {
      return res.status(400).json({ message: 'Título, organización, categoría, estado y descripción son requeridos' });
    }

    const opportunity = await createOpportunity(
      titulo,
      organizacion,
      categoria,
      estado,
      descripcion,
      monto || '',
      ciudad || '',
      contacto || '',
      Array.isArray(requisitos) ? requisitos : []
    );
    res.status(201).json({ message: 'Oportunidad creada correctamente', opportunity });
  } catch (error) {
    console.error('Error al crear oportunidad:', error);
    res.status(500).json({ message: 'Error al crear la oportunidad' });
  }
};

export const updateOpportunityController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const opportunityId = req.params.id;
    const { titulo, organizacion, categoria, estado, descripcion, monto, ciudad, contacto, requisitos } = req.body;
    if (!opportunityId || !titulo || !organizacion || !categoria || !estado || !descripcion) {
      return res.status(400).json({ message: 'ID, título, organización, categoría, estado y descripción son requeridos' });
    }

    const opportunity = await updateOpportunity(
      opportunityId,
      titulo,
      organizacion,
      categoria,
      estado,
      descripcion,
      monto || '',
      ciudad || '',
      contacto || '',
      Array.isArray(requisitos) ? requisitos : []
    );
    if (!opportunity) {
      return res.status(404).json({ message: 'Oportunidad no encontrada' });
    }

    res.status(200).json({ message: 'Oportunidad actualizada correctamente', opportunity });
  } catch (error) {
    console.error('Error al actualizar oportunidad:', error);
    res.status(500).json({ message: 'Error al actualizar la oportunidad' });
  }
};

export const deleteOpportunityController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const opportunityId = req.params.id;
    if (!opportunityId) {
      return res.status(400).json({ message: 'ID de la oportunidad es requerido' });
    }

    const deleted = await deleteOpportunity(opportunityId);
    if (!deleted) {
      return res.status(404).json({ message: 'Oportunidad no encontrada' });
    }

    res.status(200).json({ message: 'Oportunidad eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar oportunidad:', error);
    res.status(500).json({ message: 'Error al eliminar la oportunidad' });
  }
};

export const purchaseMarketplaceController = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No hay artículos para procesar en la compra' });
    }

    const movimientosCreados = [];
    const productosActualizados = [];

    for (const item of items) {
      const cantidad = Number(item.cantidad) || 1;
      const monto = Number(item.monto);
      if (Number.isNaN(monto) || monto <= 0 || cantidad <= 0) {
        continue;
      }

      let producto = null;
      if (item.productoId) {
        producto = await getMarketplaceProductById(item.productoId);
      }

      if (producto) {
        if (producto.stock < cantidad) {
          return res.status(400).json({ message: `Stock insuficiente para ${producto.nombre_articulo || producto.emprendimiento}` });
        }

        await decrementMarketplaceProductStock(item.productoId, cantidad);
        productosActualizados.push({ ...producto, stock: Math.max(producto.stock - cantidad, 0) });
      }

      const gastoConcepto = `Compra: ${item.nombreArticulo || item.nombre || 'Marketplace'}`;
      const gastoMovimiento = await createFinanzasMovimiento(req.user.id, gastoConcepto, 'Gastos', monto, item.fecha || 'Hoy');
      movimientosCreados.push(gastoMovimiento);

      const vendedorId = item.sellerId;
      if (Number(vendedorId) && Number(vendedorId) !== Number(req.user.id)) {
        const ingresoConcepto = `Venta: ${item.nombreArticulo || item.nombre || 'Marketplace'}`;
        const ingresoMovimiento = await createFinanzasMovimiento(Number(vendedorId), ingresoConcepto, 'Ingresos', monto, item.fecha || 'Hoy');
        movimientosCreados.push(ingresoMovimiento);
      }
    }

    res.status(200).json({ message: 'Compra procesada correctamente', movimientos: movimientosCreados, productosActualizados });
  } catch (error) {
    console.error('Error al procesar compra del marketplace:', error);
    res.status(500).json({ message: 'Error al procesar la compra' });
  }
};

// RF-1.4: Cambiar Contraseña
export const changePassword = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    let { contraseñaActual, contraseñaNueva, confirmarContraseña } = req.body;
    if (typeof contraseñaActual === 'string') contraseñaActual = contraseñaActual.normalize('NFC');
    if (typeof contraseñaNueva === 'string') contraseñaNueva = contraseñaNueva.normalize('NFC');
    if (typeof confirmarContraseña === 'string') confirmarContraseña = confirmarContraseña.normalize('NFC');

    if (!contraseñaActual || !contraseñaNueva || !confirmarContraseña) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    if (contraseñaNueva.length < 8) {
      return res.status(400).json({ message: 'La nueva contraseña debe tener mínimo 8 caracteres' });
    }

    if (contraseñaNueva !== confirmarContraseña) {
      return res.status(400).json({ message: 'Las contraseñas no coinciden' });
    }

    // Obtener usuario actual con contraseña para verificar el cambio
    const usuario = await getUserWithPasswordById(usuarioId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const contraseñaValida = await bcrypt.compare(contraseñaActual, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const contraseñaHasheada = await bcrypt.hash(contraseñaNueva, salt);

    // Actualizar contraseña
    await updateUserPassword(usuarioId, contraseñaHasheada);

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar contraseña' });
  }
};

export const getUserCourses = async (req, res) => {
  try {
    const registros = await getUserCourseProgress(req.user.id);
    res.status(200).json({ courses: registros });
  } catch (error) {
    console.error('Error al obtener cursos del usuario:', error);
    res.status(500).json({ message: 'Error al obtener tus cursos' });
  }
};

export const registerUserCourseController = async (req, res) => {
  try {
    const { courseId, progreso = 10 } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: 'El curso es requerido' });
    }

    const registro = await registerUserCourse(req.user.id, courseId, Number(progreso));
    res.status(200).json({ message: 'Curso inscrito correctamente', course: registro });
  } catch (error) {
    console.error('Error al inscribir curso:', error);
    res.status(500).json({ message: 'No se pudo guardar la inscripción' });
  }
};

export const updateUserCourseProgressController = async (req, res) => {
  try {
    const { courseId, progreso } = req.body;

    if (!courseId || progreso === undefined || progreso === null) {
      return res.status(400).json({ message: 'El curso y el progreso son requeridos' });
    }

    const registro = await updateUserCourseProgress(req.user.id, courseId, Number(progreso));
    res.status(200).json({ message: 'Progreso actualizado correctamente', course: registro });
  } catch (error) {
    console.error('Error al actualizar progreso:', error);
    res.status(500).json({ message: 'No se pudo actualizar el progreso' });
  }
};

// RF-1.5: Listar Usuarios (solo admin)
export const listUsers = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const usuarios = await getAllUsers();

    res.status(200).json({
      users: usuarios,
      total: usuarios.length,
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error al listar usuarios' });
  }
};

// RF-1.5: Actualizar Rol de Usuario (solo admin)
export const updateUserRoleController = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado. Solo administradores' });
    }

    const { usuarioId, rol } = req.body;

    if (!usuarioId || !rol) {
      return res.status(400).json({ message: 'ID de usuario y rol son requeridos' });
    }

    if (!['usuario', 'admin'].includes(rol)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    await updateUserRole(usuarioId, rol);

    res.status(200).json({
      message: 'Rol actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};

// RF-1.5: Revelar contraseña de usuario (solo admin)
export const revealUserPasswordController = async (req, res) => {
  try {
    const { id } = req.params;
    const { contraseñaAdmin } = req.body;

    if (!id || !contraseñaAdmin) {
      return res.status(400).json({ message: 'ID de usuario y contraseña de administrador son requeridos' });
    }

    const adminUser = await getUserWithPasswordById(req.user.id);
    if (!adminUser) {
      return res.status(401).json({ message: 'Administrador no encontrado' });
    }

    const contraseñaValida = await bcrypt.compare(contraseñaAdmin, adminUser.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ message: 'Contraseña de administrador incorrecta' });
    }

    const usuario = await getUserWithPasswordById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      passwordHash: usuario.contraseña,
      message: 'Se muestra el hash de la contraseña. Las contraseñas no están disponibles en texto plano por seguridad.',
    });
  } catch (error) {
    console.error('Error al revelar la contraseña:', error);
    res.status(500).json({ message: 'Error al revelar la contraseña' });
  }
};

// RF-1.5: Resetear contraseña del usuario (solo admin)
export const resetUserPasswordController = async (req, res) => {
  try {
    const { id } = req.params;
    const { contraseñaAdmin } = req.body;

    if (!id || !contraseñaAdmin) {
      return res.status(400).json({ message: 'ID de usuario y contraseña de administrador son requeridos' });
    }

    const adminUser = await getUserWithPasswordById(req.user.id);
    if (!adminUser) {
      return res.status(401).json({ message: 'Administrador no encontrado' });
    }

    const contraseñaValida = await bcrypt.compare(contraseñaAdmin, adminUser.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ message: 'Contraseña de administrador incorrecta' });
    }

    const usuario = await getUserWithPasswordById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const generateTemporaryPassword = () => {
      const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
      return Array.from({ length: 12 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join('');
    };

    const temporaryPassword = generateTemporaryPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    await updateUserPassword(usuario.id, hashedPassword);

    res.status(200).json({
      message: 'Contraseña temporal generada y actualizada correctamente',
      temporaryPassword,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error al resetear la contraseña:', error);
    res.status(500).json({ message: 'Error al resetear la contraseña' });
  }
};
