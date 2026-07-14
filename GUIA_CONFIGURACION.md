# 📚 GUÍA COMPLETA DE CONFIGURACIÓN

## Estructura del Proyecto

```
plataforma/
├── frontend/               (Frontend - React + Vite) ✅
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/                (Backend - Node.js + Express) 🆕
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── database/
│   ├── package.json
│   ├── server.js
│   └── ...
└── ACTUALIZACIONES.md      (Resumen de cambios recientes)
```

## Estado actual del proyecto

La plataforma ya incluye las siguientes secciones funcionales:
- Autenticación y registro de usuarios.
- Recuperación de contraseña y gestión de perfil.
- Marketplace con vistas de productos o servicios.
- Catálogo de cursos y seguimiento de progreso.
- Secciones de finanzas, comunidad y oportunidades.
- Estilos nuevos para mejorar la experiencia visual del frontend.

> Puedes consultar el archivo [ACTUALIZACIONES.md](ACTUALIZACIONES.md) para ver un resumen de los cambios más recientes.

---

## 🗄️ PASO 1: Configurar Base de Datos MySQL

### Opción A: Usando XAMPP (Recomendado)

1. **Abre phpMyAdmin**
   - Asegúrate que XAMPP está corriendo (Apache + MySQL)
   - Accede a: `http://localhost/phpmyadmin`

2. **Crea la base de datos**
   - Haz clic en "Nueva" en el panel izquierdo
   - Nombre: `plataforma_db`
   - Collation: `utf8mb4_unicode_ci`
   - Haz clic en "Crear"

3. **Ejecuta el script SQL**
   - Ve a la pestaña "SQL"
   - Abre el archivo `backend/database/schema.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL de phpMyAdmin
   - Presiona "Ejecutar"

4. **Verifica las tablas**
   - Selecciona la BD `plataforma_db`
   - Deberías ver las tablas: `usuarios`, `tokens_recuperacion`, `sesiones`

### Opción B: Desde terminal MySQL

```bash
mysql -u root < backend/database/schema.sql
```

---

## 🔧 PASO 2: Configurar Variables de Entorno

1. **En la carpeta `backend/`**
   ```bash
   cp .env.example .env
   ```

2. **Edita el archivo `.env`**
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=plataforma_db
   JWT_SECRET=tu_clave_secreta_muy_segura_aqui_12345
   NODE_ENV=development
   ```

   > **Nota**: Si tu MySQL tiene contraseña, colócala en `DB_PASSWORD`

---

## 📦 PASO 3: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

Esto instalará:
- ✅ express (framework web)
- ✅ mysql2 (conexión a BD)
- ✅ bcryptjs (encriptación de contraseñas)
- ✅ jsonwebtoken (JWT para autenticación)
- ✅ dotenv (variables de entorno)
- ✅ cors (permitir solicitudes del frontend)

---

## 🚀 PASO 4: Ejecutar el Backend

```bash
cd backend
npm run dev
```

**Resultado esperado:**
```
✓ Backend ejecutándose en http://localhost:5000
✓ API disponible en http://localhost:5000/api
```

---

## 💻 PASO 5: Ejecutar el Frontend

En **otra terminal**:

```bash
cd frontend
npm run dev
```

**Resultado esperado:**
```
VITE v8.0.16 ready in 300ms
Local: http://localhost:5174/
```

---

## ✅ PASO 6: Probar la Aplicación

### En el Frontend (http://localhost:5174/)

1. Haz clic en "Crear cuenta"
2. Completa el formulario:
   - Nombre: `Juan Pérez`
   - Email: `juan@example.com`
   - Contraseña: `Password123`
   - Confirmar: `Password123`
3. Haz clic en "Crear Cuenta"
4. Si ves "¡Cuenta creada exitosamente!" → **¡Funciona!** ✅

### En la Base de Datos

1. Ve a phpMyAdmin
2. Abre la tabla `usuarios`
3. Deberías ver el usuario creado con:
   - Contraseña **encriptada** (no se ve la contraseña original)
   - Rol: `usuario`
   - Fecha de registro

---

## 🔗 Endpoints de API

### Públicos (Sin autenticación)

**Crear Cuenta:**
```
POST http://localhost:5000/api/auth/register

Body:
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contraseña": "Password123",
  "confirmarContraseña": "Password123"
}

Response:
{
  "message": "Cuenta creada exitosamente",
  "user": { "id": 1, "nombre": "Juan Pérez", ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Iniciar Sesión:**
```
POST http://localhost:5000/api/auth/login

Body:
{
  "correo": "juan@example.com",
  "contraseña": "Password123"
}

Response:
{
  "message": "Sesión iniciada exitosamente",
  "user": { "id": 1, "nombre": "Juan Pérez", ... },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Protegidos (Requieren token en Authorization)

```
GET http://localhost:5000/api/auth/profile
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 🛠️ Solucionar Problemas

### Error: "Cannot find module 'express'"
```bash
cd backend
npm install
```

### Error: "Connection refused" (Base de datos)
1. Verifica que XAMPP MySQL está corriendo
2. Verifica que creaste la BD `plataforma_db`
3. Verifica las credenciales en `.env`

### Error: "CORS error"
- El backend CORS está habilitado
- Asegúrate que el frontend accede a `http://localhost:5000`

### Error: "Port 5000 already in use"
```bash
# Cambia el puerto en .env
PORT=5001
```

---

## 📋 Checklist

- [ ] XAMPP corriendo (Apache + MySQL)
- [ ] Base de datos `plataforma_db` creada
- [ ] Script SQL ejecutado (3 tablas creadas)
- [ ] Archivo `.env` configurado en backend/
- [ ] Dependencias instaladas (`npm install`)
- [ ] Backend corriendo en http://localhost:5000
- [ ] Frontend corriendo en http://localhost:5174
- [ ] Pruebas de registro completadas
- [ ] Token se guarda en localStorage

---

## 🎯 Próximos Pasos

- [ ] Implementar RF-1.3: Recuperación de Contraseña
- [ ] Implementar RF-1.4: Gestión de Perfil
- [ ] Implementar RF-1.5: Panel de Roles (Admin)
- [ ] Implementar RF-2.1: Catálogo Educativo
- [ ] Implementar RF-3.1: Gestión de Presupuestos
- [ ] Y más...

---

## 📞 Ayuda

Si tienes problemas:
1. Revisa la consola del backend (última línea de error)
2. Revisa la consola del navegador (F12 → Console)
3. Verifica phpMyAdmin que la BD existe
4. Revisa que los puertos 5000 y 5174 están libres
