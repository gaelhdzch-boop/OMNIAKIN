# Plataforma para Mujeres Emprendedoras

## Resumen del proyecto
Esta plataforma incluye:
- Backend en Node.js + Express para autenticación, recuperación de contraseña y administración de usuarios.
- Frontend en React + Vite para registro, inicio de sesión, perfil, marketplace, cursos, finanzas, comunidad y oportunidades.
- Base de datos MySQL con tablas de usuarios, cursos, tokens de recuperación y sesiones.

## Actualizaciones recientes
- Se consolidó la aplicación en la carpeta frontend con una estructura más organizada.
- Se añadieron nuevas vistas para marketplace, cursos, finanzas, comunidad y oportunidades.
- Se mejoró el flujo de autenticación, registro y perfil de usuario.
- Se incorporaron estilos nuevos para formularios, perfil, marketplace y secciones de finanzas.
- Se creó un archivo de seguimiento de cambios en [ACTUALIZACIONES.md](ACTUALIZACIONES.md).

## Estructura principal

```
plataforma/
├── backend/            # API y lógica del servidor
├── frontend/           # Frontend React + Vite
└── GUIA_CONFIGURACION.md
```

## Backend

### Tecnologías
- Node.js
- Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- bcrypt (`bcryptjs`)
- Dotenv para variables de entorno
- CORS habilitado

### Archivos clave
- `backend/server.js` - servidor Express y configuración global
- `backend/routes/authRoutes.js` - rutas de autenticación y perfil
- `backend/controllers/authController.js` - controladores de registro, login, recuperación y administración
- `backend/models/userModel.js` - consultas SQL y acceso a datos
- `backend/middleware/auth.js` - validación de JWT y verificación de administrador
- `backend/database/schema.sql` - esquema de base de datos

### Funcionalidad implementada
- Registro de usuario con validación y hash de contraseña, incluyendo pregunta y respuesta de seguridad
- Inicio de sesión con JWT
- Validaciones de correo y contraseña en backend
- Recuperación de contraseña mediante respuesta a pregunta de seguridad
- Gestión de cursos inscritos y progreso de usuarias
- Consulta y actualización de perfil autenticado
- Cambio de contraseña autenticado
- Rutas administradoras protegidas por rol `admin`

### Endpoints principales
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `PUT /api/auth/change-password`
- `GET /api/auth/courses`
- `POST /api/auth/courses/register`
- `PUT /api/auth/courses/progress`
- `GET /api/auth/users` (admin)
- `PUT /api/auth/users/role` (admin)

## Frontend

### Tecnologías
- React
- Vite
- CSS modular en `src/styles`

### Archivos clave
- `frontend/src/App.jsx` - navegación entre home, auth, profile y sesión cerrada
- `frontend/src/services/api.js` - llamadas a la API y manejo de tokens
- `frontend/src/components/AuthPage.jsx` - página principal de autenticación
- `frontend/src/components/Login.jsx` - formulario de inicio de sesión
- `frontend/src/components/SignUp.jsx` - formulario de registro
- `frontend/src/components/ForgotPassword.jsx` - solicitud de restablecimiento
- `frontend/src/components/ResetPassword.jsx` - formulario de nueva contraseña
- `frontend/src/components/Profile.jsx` - vista de perfil del usuario
- `frontend/src/components/Navbar.jsx` - navegación del sitio
- `frontend/src/components/SessionClosed.jsx` - pantalla de cierre de sesión
- `frontend/src/components/HeroSection.jsx`, `FeaturesGrid.jsx`, `OpportunitiesBanner.jsx` - contenido de la página de inicio
- `frontend/src/components/Marketplace.jsx` - interfaz tipo e-commerce para el marketplace
- `frontend/src/components/Cursos.jsx` - interfaz de catálogo de cursos
- `frontend/src/components/OpportunitiesBanner.jsx` - sección de oportunidades

### Funcionalidad implementada
- Registro y login con persistencia de token en `localStorage`
- Acceso a vista de perfil cuando el usuario está autenticado
- Navegación condicional entre home, auth, profile, marketplace, cursos y comunidad
- Página de cursos con búsqueda, filtrado, inscripción, avance y reinicio
- Persistencia del progreso de cursos de la usuaria y visualización en perfil
- Flujo de recuperación de contraseña mediante pregunta de seguridad
- Manejo de sesión cerrada
- Integración con API backend usando `fetch`
- Interfaces de Marketplace y Cursos separadas del home
- Estilos renovados en los formularios de búsqueda para fondo blanco y texto negro

## Configuración recomendada
1. Configurar MySQL y crear la base de datos usando `backend/database/schema.sql`
2. Copiar y editar el archivo de entorno en `backend/` con variables como `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `JWT_SECRET`
3. Instalar dependencias del backend:
   ```bash
   cd backend
   npm install
   ```
4. Iniciar backend:
   ```bash
   npm run dev
   ```
5. Instalar dependencias del frontend:
   ```bash
   cd frontend
   npm install
   ```
6. Iniciar frontend:
   ```bash
   npm run dev
   ```

## Notas finales
- El backend protege rutas con JWT y distingue administración por rol.
- El backend incluye endpoints para registrar cursos, actualizar progreso y consultar cursos inscritos.
- La recuperación de contraseña se realiza respondiendo a la pregunta de seguridad registrada por la usuaria.
- La plataforma ya cuenta con los componentes principales para autenticación, cursos y perfil de usuaria.

> Para detalles de instalación y configuración paso a paso, consulta `GUIA_CONFIGURACION.md`.
