# 📘 Sistema de Notas Disciplinarias

Sistema Angular para gestión de notas disciplinarias de empleados en Megacable. Los jefes pueden crear, ver y gestionar notas de incumplimiento de sus subordinados.

---

## 🚀 Quick Start

```bash
# 1. Instalar dependencias
npm install

# 2. Asegúrate que el backend corre en puerto 7199
# (Visual Studio: apunta a https://localhost:7199)

# 3. Inicia Angular
# Usa el script que ya incluye el proxy (ver proxy.conf.json)
npm start

# Alternativa equivalente:
# ng serve --proxy-config proxy.conf.json

# 4. Abre el navegador
http://localhost:4200

# 5. Si no tienes token de ItGov, simula uno:
http://localhost:4200?acces_token=TU_JWT_TOKEN_AQUI
```

---

## 🧪 Correr en local (para pruebas)

### Requisitos
- Node.js LTS + npm
- Backend API corriendo en `https://localhost:7199`

### 1) Levantar el API (backend)
- Desde Visual Studio (Run/Debug) o `dotnet run` (según tu repo de API)
- Verifica que responde en `https://localhost:7199` y que tus endpoints están bajo `/api/...`

### 2) Levantar el Front (Angular)
En la raíz de este repo:

```bash
npm install
npm start
```

Notas:
- `npm start` corre `ng serve` con proxy (ver [proxy.conf.json](proxy.conf.json)).
- En desarrollo el front usa `apiUrl: "/api"` (ver [src/environments/environment.ts](src/environments/environment.ts)) y el dev-server proxyea a `https://localhost:7199`.

### 3) Entrar a la app
- `http://localhost:4200`

### 4) Simular SSO (token en URL)
- `http://localhost:4200?acces_token=TU_JWT_TOKEN_AQUI`

### Si tu API local NO corre en 7199
Edita el `target` en [proxy.conf.json](proxy.conf.json) y vuelve a correr `npm start`.

---

## 🚀 Levantar en producción (build + IIS)

### 1) Generar build de producción
Desde la raíz del repo:

```bash
npm install
npm run build
```

Salida esperada:
- Carpeta: `dist/notas-disciplinarias/browser/`

Nota:
- El build de producción usa `environment.prod.ts` gracias a `fileReplacements` en [angular.json](angular.json).

### 2) Publicar el Front en IIS
1. Copia el contenido de `dist/notas-disciplinarias/browser/` a la carpeta física del sitio IIS (por ejemplo `C:\inetpub\wwwroot\notas-disciplinarias`).
2. Instala el módulo **URL Rewrite** en IIS.
3. Confirma que se publicó el `web.config` de SPA (viene de [public/web.config](public/web.config) y se copia al build).

Esto es lo que evita 404 al refrescar rutas como `/login`, `/admin`, etc.

### 3) Configurar a qué API apunta en producción
La URL base del API en producción se define en [src/environments/environment.prod.ts](src/environments/environment.prod.ts).

Por defecto, el repo soporta el escenario:
- Front en `:80`
- API en `:84`

Si tu API está en otro puerto/host, ajusta el puerto/URL en ese archivo y vuelve a compilar.

### 4) Validación rápida en navegador
- Abre el front publicado.
- F12 → Network → verifica que las llamadas vayan a `http(s)://<host>:84/api/...` (o el host/puerto que corresponda).


---

## ✅ Qué se cambió para que funcionara en IIS (Front + API)

### 1) El build de producción NO estaba usando el environment de producción
Síntoma: ya publicado en IIS, el navegador intentaba pegarle al backend como relativo (por ejemplo `http(s)://<front>:80/api/...`) y eso terminaba en 404 porque el API estaba en otro sitio/puerto.

Cambio aplicado:
- Se agregó el reemplazo de archivos de entorno en producción en [angular.json](angular.json) para que `environment.ts` se reemplace por `environment.prod.ts` al hacer build.

### 2) En producción el API vive en otro puerto (front :80 vs API :84)
Síntoma: aun con el build, si `apiUrl` queda como `/api`, el browser busca el API en el mismo origen del front.

Cambio aplicado:
- Se ajustó [src/environments/environment.prod.ts](src/environments/environment.prod.ts) para construir dinámicamente la URL del API:
  - Si estás navegando en el mismo puerto del API, usa `/api`.
  - Si no, apunta al mismo host pero al puerto del API (por defecto `:84`).

### 3) El sitio Angular en IIS daba 404 al recargar rutas (/login, /admin, etc.)
Síntoma: IIS intentaba buscar un archivo físico `/login` y devolvía 404.

Cambio aplicado:
- Se agregó [public/web.config](public/web.config) con regla de URL Rewrite para SPAs:
  - Reescribe rutas a `/index.html`.
  - Excluye `/api` para no romper el backend.
  - No reescribe archivos/carpetas reales.

### 4) (Opcional) Limpieza de código que rompía build
Si se pegó accidentalmente un comando en el código, el build truena o se filtra información. Se revisó [src/app/app.component.ts](src/app/app.component.ts) para dejarlo limpio.

---

## 🧩 Qué se tuvo que ajustar para que el API corriera en IIS

> Nota: el backend (API) no vive en este repo, pero estos fueron los puntos que causan el “en mi PC sí, en IIS no”.

### A) Conexión a SQL Server (Error típico: 500 por login de SQL)
En IIS el API corre con la identidad del AppPool; si SQL está en Windows Auth, suele fallar.

Recomendación:
- Usar **SQL Auth** en `ConnectionStrings` (usuario/contraseña) y validar que SQL esté en **Mixed Mode**.
- Verificar que el usuario tenga permisos en la BD.

### B) JWT HS256: la llave debe tener mínimo 256 bits
Si el API genera JWT con HS256 y la llave (`Jwt:Key`) es corta, falla con un error tipo `IDX10720`.

Recomendación:
- Usar una llave de al menos **32 bytes** (por ejemplo, un secreto aleatorio largo) para HS256.
- No reutilizar el password de SQL como llave JWT.

### C) Logs para ver el error real (evita “500 genérico”)
En IIS habilita `stdout` en el `web.config` del API (aspNetCore) temporalmente para obtener el stack trace y corregir la causa real.


---

## 📖 Documentación

| Documento | Contenido |
|-----------|-----------|
| **[ARQUITECTURA.md](ARQUITECTURA.md)** | 🏗️ Flujos completos, estructura de carpetas, endpoints |
| **[GUIA_RAPIDA.md](GUIA_RAPIDA.md)** | ⚡ Debugging, errores comunes, tareas frecuentes |
| **[DICCIONARIO_DATOS.md](DICCIONARIO_DATOS.md)** | 📋 Estructuras de datos, modelos, validaciones |
| **[API_ENDPOINTS.md](API_ENDPOINTS.md)** | 📡 Documentación completa de API Backend |
| **[DEPLOYMENT.md](DEPLOYMENT.md)** | 🚀 Guía de despliegue a producción (IIS, Nginx, Azure) |
| **[TESTING.md](TESTING.md)** | 🧪 Guía de testing, ejemplos, buenas prácticas |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | 🤝 Guía para colaboradores, Git workflow, estándares |

---

## 🎯 Flujo Principal (3 pasos)

### 1. Usuario se Autentica
```
ItGov → Redirige a Angular con JWT en URL
  ↓
AppComponent captura token
  ↓
Decodifica con AuthService
  ↓
Guarda en localStorage
  ↓
Muestra LoginComponent
```

### 2. Admin Abre Notas
```
LoginComponent → Click "Abrir Notas de Empleados"
  ↓
SenalarProblemaComponent
  ↓
Carga lista de subordinados
  ↓
Muestra dropdown
```

### 3. Admin Crea Nota
```
Selecciona: Empleado + Categoría + Descripción
  ↓
POST /api/Casos/crear
  ↓
Backend guarda en BD
  ↓
Confirmación: ¡Caso creado!
```

---

## 🏗️ Estructura del Proyecto

```
src/app/
├── app.component.ts              ← 🔐 Captura token, header/footer
├── app.routes.ts                 ← 🔀 Definición de rutas
│
├── services/                     ← 🌐 HTTP + lógica
│   ├── auth.service.ts           ← Decodifica JWT
│   ├── usuarios.service.ts       ← GET subordinados
│   ├── casos.service.ts          ← CRUD notas
│   └── categorias.service.ts     ← Catálogo
│
├── models/                       ← 📊 Interfaces TypeScript
│   ├── caso-create.model.ts
│   └── categoria.model.ts
│
└── features/                     ← 🎨 Componentes
    ├── login/                    ← 👋 Bienvenida
    ├── senalar-problema/         ← ✍️ Crear notas
    ├── usuario/                  ← 👁️ Ver mis notas
    └── admin/                    ← ⚙️ Panel admin
```

---

## 🔧 Tecnologías

- **Angular 20** - Framework
- **TypeScript** - Lenguaje
- **jwt-decode** - Decodificar JWT
- **RxJS** - Observables (Async)
- **SCSS** - Estilos
- **Proxy** - Evitar CORS en desarrollo

---

## 🔌 Endpoints (Backend en puerto 7199)

```
GET    /api/Usuarios/jerarquia/{idUsuario}  → Obtener subordinados
POST   /api/Casos/crear                     → Crear nota
GET    /api/admin/casos?idUsuario={id}      → Ver mis notas (incluye activos + cerrados)
GET    /api/admin/casos-activos?idUsuario={id} → Fallback: solo activos
GET    /api/admin/casos?idJefe={id}         → Ver casos del jefe (incluye activos + cerrados)
GET    /api/admin/casos-activos?idJefe={id} → Fallback: solo activos
GET    /api/Categorias                      → Catálogo
```

---

## 🧪 Developers: Empieza aquí

### 1. Lee la documentación en este orden
1. Este README (estás aquí)
2. [ARQUITECTURA.md](ARQUITECTURA.md) - Entiende flujos
3. [DICCIONARIO_DATOS.md](DICCIONARIO_DATOS.md) - Modelos de datos
4. [GUIA_RAPIDA.md](GUIA_RAPIDA.md) - Debugging

### 2. Revisa los comentarios en código
```typescript
// Cada archivo .ts tiene comentarios detallados explicando:
// - QUÉ hace (responsabilidad)
// - POR QUÉ se hace así (motivación)
// - CÓMO se integra (relaciones)

// Archivos principales comentados:
- src/app/app.component.ts
- src/app/services/auth.service.ts
- src/app/services/usuarios.service.ts
- src/app/features/senalar-problema/senalar-problema.component.ts
```

### 3. Prueba el flujo
```bash
# Terminal 1: Angular
npm start

# Terminal 2: Backend (Visual Studio) en puerto 7199

# Browser: http://localhost:4200?acces_token=TOKEN
```

---

## 🐛 Debugging

### Ver estado en consola (F12)
```javascript
// Abre: http://localhost:4200?acces_token=...
// Ve la consola y busca:

🌐 AppComponent iniciado
🔑 TOKEN CAPTURADO desde URL: eyJ0...
✅ Usuario guardado: { Id: 12345, Nombre_Completo: "Juan..." }
📋 Respuesta completa de API: { resultados: [...] }
✅ Empleados cargados: 5
```

### Si no ves empleados en dropdown
```
1. Abre F12 → Console
2. Busca "📋 Respuesta completa de API"
3. Verifica data.resultados existe
4. Si no, revisa GUIA_RAPIDA.md → "¿El dropdown no muestra empleados?"
```

---

## 📁 Archivos Importantes

| Archivo | Función |
|---------|---------|
| `proxy.conf.json` | Redirige /api a localhost:7199 |
| `angular.json` | Configuración de Angular |
| `src/environments/` | URLs por entorno (dev/prod) |
| `src/index.html` | HTML principal + favicon |
| `src/styles.scss` | Estilos globales |

---

## 🚨 Errores Comunes

### ❌ "404 Not Found en /api/Usuarios/jerarquia"
```
✅ Solución: Verifica que backend corre en puerto 7199
```

### ❌ "No se puede parsear token"
```
✅ Solución: Obtén un JWT válido de ItGov
           O crea uno en: https://jwt.io
```

### ❌ "El dropdown está vacío"
```
✅ Solución: Ver sección "Debugging" arriba
```

---

## 📝 Notas Importantes

- ✅ Autenticación centralizada en `AuthService`
- ✅ Todas las rutas HTTP en servicios `src/app/services/`
- ✅ Todos los datos de usuario vienen del JWT
- ✅ LocalStorage guarda token + usuario decodificado
- ✅ Proxy intercepta `/api/*` en desarrollo
- ✅ Backend valida todo (no confiar solo en frontend)

---

## 🔐 Seguridad

- ✅ Token se guarda en localStorage (considerar sessionStorage)
- ✅ JWT se decodifica pero NO se valida firma (confiar en ItGov)
- ✅ URL se limpia después de capturar token
- ✅ TODO: Agregar validación de token expirado
- ✅ TODO: Agregar Auth Guards en rutas protegidas

---

## 🔄 Próximas Mejoras

- [ ] Auth Guard para proteger rutas
- [ ] Validar token expirado antes de cada petición
- [ ] Interceptor HTTP para pasar token en headers
- [ ] Traer categorías del backend (no hardcodear)
- [ ] Tests unitarios e integración
- [ ] Error handling más robusto
- [ ] Logout limpiar correctamente
- [ ] Caché de datos (memo)
- [ ] Paginación en listas

---

## 💬 Preguntas Frecuentes

**P: ¿Cómo debuggear acciones?**  
R: Abre F12 → Console → busca logs con emoji (🔐, 🌐, ✅, etc)

**P: ¿Puedo ver el token decodificado?**  
R: `localStorage.getItem('usuario') | json` en template, o console.log()

**P: ¿Cuál es el ciclo de una nota?**  
R: Creación → Acción → Evaluación → (Resolución o Acta)

**P: ¿Solo jefes pueden crear notas?**  
R: Sí, el backend valida basado en si tienes subordinados

---

## 🤝 Contribución

```bash
# Antes de pushear:
1. Comenta tu código explicando QUÉ y POR QUÉ
2. Actualiza ARQUITECTURA.md si cambian flujos
3. Prueba en consola (F12) que los logs salen
4. Verifica que el backend devuelve lo esperado
```

---

## 📞 Contacto

- 📧 **Backend** (Visual Studio): Tu equipo
- 📧 **Frontend** (Angular): Este repo
- 🔐 **Auth** (ItGov): Sistema corporativo

---

## 📚 Referencias

- [Angular Docs](https://angular.io)
- [jwt-decode](https://github.com/auth0/jwt.io)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 📄 Licencia

© 2025 Megacable - Sistema Interno

---

**Última actualización**: Enero 2026  
**Versión**: 1.0  
**Ambiente**: Desarrollo

---

### 🎓 Para Nuevo Desarrollador

1. Lee este README (5 min)
2. Lee [ARQUITECTURA.md](ARQUITECTURA.md) (15 min)
3. Lee los comentarios en código (20 min)
4. Ejecuta `npm start` (2 min)
5. Abre DevTools F12 y prueba (10 min)
6. ¡Ya estás listo! (Total: ~1 hora)

---

**¿Necesitas ayuda?** Revisa los comentarios en los archivos .ts 📝

ng test

## 📂 Estructura del proyecto

src/
  app/
    features/                # Módulos y funcionalidades principales
      acta-administrativa/   # Gestión de actas administrativas
      admin/                 # Panel de administración
      determinar-causa/      # Módulo para determinar causas
      evaluar-resultados/    # Evaluación de resultados
      login/                 # Pantalla de inicio de sesión
      nota-incumplimiento/   # Gestión de notas por incumplimiento
      plan-accion/           # Planes de acción correctiva
      senalar-problema/      # Reporte de problemas
      usuario/               # Gestión de usuarios
    models/                  # Modelos de datos (interfaces TypeScript)
      caso-admin.model.ts
      caso-create.model.ts
      categoria.model.ts
    services/                # Servicios para comunicación con la API
      casos.service.ts
      categorias.service.ts
      usuarios.service.ts
    app.component.ts          # Componente raíz de la aplicación
    app.component.scss        # Estilos del componente raíz
    app.config.ts             # Configuración global
    app.routes.ts             # Definición de rutas
    app.html                  # Plantilla principal
    app.spec.ts               # Pruebas del componente raíz
  assets/img/                # Imágenes y recursos gráficos
    Logo.jpg
    mega-building.jpg
    mega-icon.ico
  index.html                 # Archivo HTML principal
  main.ts                    # Punto de entrada de la aplicación
  styles.scss                # Estilos globales
.editorconfig               # Configuración de estilo de código
angular.json                # Configuración del proyecto Angular
package.json                # Dependencias y scripts del proyecto
package-lock.json           # Bloqueo de dependencias
README.md                   # Documentación del proyecto
tsconfig.app.json           # Configuración TypeScript para la aplicación
tsconfig.json               # Configuración global de TypeScript
tsconfig.spec.json          # Configuración TypeScript para pruebas


## 🌐 Relación con otros repositorios
Este proyecto se conecta con el backend disponible en el repositorio:
NotasDisciplinarias.API 

📚 Recursos adicionales
Para más información sobre Angular CLI y referencias detalladas de comandos, visita:
https://angular.dev/tools/cli

