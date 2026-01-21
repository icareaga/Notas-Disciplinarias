# 📘 Sistema de Notas Disciplinarias - Documentación Arquitectónica

## 📋 Descripción General

Sistema Angular standalone para gestión de notas disciplinarias de empleados en Megacable. Los jefes pueden crear, ver y gestionar notas de incumplimiento de sus subordinados.

---

## 🏗️ Arquitectura General

```
ITGOV (Sistema corporativo)
   ↓ (redirige con token JWT)
   
APP (Angular)
   ├─ AppComponent (Captura token de URL)
   ├─ LoginComponent (Muestra bienvenida)
   └─ SenalarProblemaComponent (Crea notas)
   
   ↓ (Peticiones HTTP vía proxy)
   
BACKEND LOCAL (Visual Studio - puerto 7199)
   ├─ /api/Usuarios/jerarquia/{idUsuario} → obtener subordinados
   ├─ /api/Casos/crear → crear nota
   ├─ /api/Casos/usuario/{idUsuario} → ver mis notas
   └─ /api/Categorias → catálogo de categorías
```

---

## 🔐 Flujo de Autenticación

### 1️⃣ **Redireccion desde ItGov**
- Usuario hace click en "Notas Disciplinarias" en ItGov
- ItGov redirige a: `http://localhost:4200/senalar-problema?acces_token=JWT_LARGO_AQUI`

### 2️⃣ **AppComponent captura token**
```typescript
// src/app/app.component.ts
ngOnInit() {
  // Busca en URL: ?acces_token=... 
  // Si existe, lo guarda en localStorage
  // Decodifica el JWT usando AuthService
  // Redirige a /login para mostrar bienvenida
}
```

### 3️⃣ **Token se decodifica con jwt-decode**
```typescript
// src/app/services/auth.service.ts
getTokenInfo() {
  const decoded = jwtDecode(token);
  return {
    Id: decoded.UserId || decoded.Id,          // Normaliza nombres
    Nombre_Completo: decoded.Nombre_Completo || decoded.Nombre,
    Correo: decoded.Correo || decoded.Email,
    Rol: decoded.Rol || decoded.Role,
    PlazaJefe: decoded.PlazaJefe,              // ID de la plaza del jefe
    ...decoded
  };
}
```

### 4️⃣ **Datos se guardan en localStorage**
```javascript
localStorage.setItem('token', 'JWT_TOKEN');
localStorage.setItem('usuario', JSON.stringify({
  Id: 12345,
  Nombre_Completo: "Juan Pérez",
  Rol: "admin",
  PlazaJefe: 114687
}));
```

### 5️⃣ **LoginComponent muestra bienvenida**
- Lee localStorage
- Muestra datos del usuario
- Si es admin, muestra botón "Abrir Notas de Empleados"
- Si es empleado regular, muestra botón "Ver Mis Notas"

---

## 🚀 Flujo Principal: Crear Nota Disciplinaria

### 1. Admin hace click en "Abrir Notas de Empleados"
```
LoginComponent → navigate('/senalar-problema')
```

### 2. SenalarProblemaComponent se carga (ngOnInit)
```typescript
// Lee usuario del localStorage
const usuario = JSON.parse(localStorage.getItem('usuario'));
const idUsuario = usuario.Id;

// Petición al backend para traer subordinados
usuariosService.obtenerJerarquia(idUsuario).subscribe(data => {
  this.empleados = data.resultados;  // Array de subordinados
});
```

### 3. Backend (/api/Usuarios/jerarquia/12345) responde
```json
{
  "resultados": [
    { "idUsuario": 101, "nombreCompleto": "María López" },
    { "idUsuario": 102, "nombreCompleto": "Carlos Ruiz" }
  ]
}
```

### 4. Admin selecciona en el formulario
- **Colaborador**: Maria López (idUsuario: 101)
- **Categoría**: "Retardo" 
- **Descripción**: "Llegó 30 minutos tarde el 15/01/2026"

### 5. Admin hace click en "Guardar"
```typescript
crearCaso() {
  const caso = {
    idUsuarioAfectado: 101,
    idCategoria: 25,  // Índice en el array categorias[]
    descripcion: "Llegó 30 minutos tarde..."
  };
  
  casosService.crearCaso(caso).subscribe(
    response => alert('Caso creado correctamente')
  );
}
```

### 6. Backend guarda la nota en base de datos
- POST a `/api/Casos/crear`
- Retorna: `{ id: 999, status: "creado" }`

---

## 📁 Estructura de Carpetas

```
src/
├── app/
│   ├── app.component.ts          ← Captura token, header/footer
│   ├── app.routes.ts             ← Definición de rutas
│   ├── app.config.ts             ← Configuración global (interceptors, etc)
│   │
│   ├── services/                 ← Servicios HTTP
│   │   ├── auth.service.ts       ← Decodifica JWT, maneja sesión
│   │   ├── usuarios.service.ts   ← GET /api/Usuarios/jerarquia
│   │   ├── casos.service.ts      ← CRUD de notas
│   │   ├── categorias.service.ts ← GET /api/Categorias
│   │   └── auth.guard.ts         ← Protege rutas (opcional)
│   │
│   ├── models/                   ← Interfaces TypeScript
│   │   ├── caso-create.model.ts  ← Interface para crear caso
│   │   └── categoria.model.ts    ← Interface de categoría
│   │
│   └── features/                 ← Componentes por funcionalidad
│       ├── login/                ← Muestra bienvenida
│       │   ├── login.component.ts
│       │   ├── login.component.html
│       │   └── login.component.scss
│       │
│       ├── senalar-problema/     ← Formulario principal
│       │   ├── senalar-problema.component.ts
│       │   ├── senalar-problema.component.html
│       │   └── senalar-problema.component.scss
│       │
│       ├── usuario/              ← Ver mis notas (empleado)
│       ├── admin/                ← Panel admin
│       └── [otras funcionalidades]
│
├── environments/                 ← Configuración por entorno
│   ├── environment.ts            ← DEV (proxy a localhost:7199)
│   └── environment.prod.ts       ← PROD (URL del backend real)
│
├── index.html                    ← HTML principal
├── main.ts                       ← Punto de entrada
└── styles.scss                   ← Estilos globales
```

---

## ⚙️ Configuración de Proxy (Desarrollo)

**proxy.conf.json** - Redirige peticiones `/api` al backend local:
```json
{
  "/api": {
    "target": "https://localhost:7199",  ← Tu backend en Visual Studio
    "secure": false,
    "changeOrigin": true
  }
}
```

**angular.json** - Usa proxy en `ng serve`:
```json
"serve": {
  "options": {
    "proxyConfig": "proxy.conf.json"
  }
}
```

**Resultado**:
- `http://localhost:4200/api/Usuarios/...` → `https://localhost:7199/api/Usuarios/...`
- Evita problemas CORS en desarrollo

---

## 🔌 Endpoints del Backend (localhost:7199)

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| GET | `/api/Usuarios/jerarquia/{idUsuario}` | Obtener subordinados de un jefe |
| POST | `/api/Casos/crear` | Crear nueva nota disciplinaria |
| GET | `/api/Casos/usuario/{idUsuario}` | Ver notas de un usuario |
| GET | `/api/admin/casos-activos` | Ver todas las notas (admin) |
| GET | `/api/Categorias` | Catálogo de categorías |

---

## 💾 Modelos de Datos

### CasoCreate (Lo que envía el frontend)
```typescript
{
  idUsuarioAfectado: 101,      // A quién va la nota
  idCategoria: 25,             // Tipo de incumplimiento
  descripcion: "Descripción"   // Detalles del problema
}
```

### Usuario (Decodificado del JWT)
```typescript
{
  Id: 12345,
  Nombre_Completo: "Juan Pérez",
  Correo: "juan@megacable.com",
  Rol: "admin",
  Plaza: "114682",
  PlazaJefe: "114687",         // Plaza del jefe (si es subordinado)
  Area: "Tecnologías",
  Departamento: "IT"
}
```

---

## 🔄 Flujo de Datos (Resumen)

```
Usuario en ItGov
    ↓ (Click en "Notas Disciplinarias")
    ↓
ItGov redirige con token JWT
    ↓ (?acces_token=...)
    ↓
AppComponent captura URL
    ↓
Decodifica JWT con auth.service
    ↓
Guarda en localStorage
    ↓
Navega a /login
    ↓
LoginComponent muestra bienvenida
    ↓ (Click "Abrir Notas" si es admin)
    ↓
SenalarProblemaComponent
    ↓
Carga subordinados: GET /api/Usuarios/jerarquia/{id}
    ↓
Muestra dropdown con empleados
    ↓ (Admin selecciona y rellena formulario)
    ↓
Clic "Guardar": POST /api/Casos/crear
    ↓
Backend crea nota en BD
    ↓
Confirmación al usuario
```

---

## 🧪 Cómo Testear

### 1. Desarrollo local
```bash
# Terminal 1: Inicia Angular
ng serve

# Terminal 2: Inicia backend en Visual Studio
# (Asegúrate que corre en puerto 7199)

# Browser: http://localhost:4200
# Espera token desde ItGov o accede con: http://localhost:4200?acces_token=TOKEN_AQUI
```

### 2. Flujo manual
- Ve a http://localhost:4200
- Si no hay token, ve a: http://localhost:4200?acces_token=`<tu-jwt-token-aqui>`
- Deberías ver LoginComponent con tus datos
- Haz click en "Abrir Notas" (si eres admin)
- Deberías ver el dropdown con tus subordinados
- Crea una nota y verifica que se guarda

---

## 📝 Notas para Desarrolladores

### ✅ Lo que está bien
- ✅ Separación de responsabilidades (servicios, componentes, modelos)
- ✅ Flujo de autenticación centralizado en AppComponent + AuthService
- ✅ Datos normalizados desde el JWT
- ✅ Error handling básico

### ⚠️ Mejoras futuras
- ⚠️ Agregar Auth Guard en rutas protegidas
- ⚠️ Validación de token expirado
- ⚠️ Traer categorías del backend en lugar de hardcodear
- ⚠️ Interceptor HTTP para pasar token en headers
- ⚠️ Manejo de errores más robusto
- ⚠️ Tests unitarios e integración
- ⚠️ Logout limpiar localStorage

---

## 🔗 Links Útiles
- 🔐 [jwt-decode docs](https://github.com/auth0/jwt.io)
- 🅰️ [Angular Standalone Components](https://angular.io/guide/standalone-components)
- 📡 [Angular HttpClient](https://angular.io/guide/http)
- 🔀 [Angular Router](https://angular.io/guide/router)

---

**Última actualización**: Enero 2026  
**Versión**: 1.0  
**Mantenedor**: Tu nombre/equipo