# 🚀 Guía Rápida - Notas Disciplinarias

## Antes de Empezar

### ✅ Requisitos
- Node.js 18+
- Angular 17+
- Visual Studio con backend corriendo en `https://localhost:7199`

### ✅ Instalación
```bash
npm install
ng serve
```

---

## 🎯 Flujos Principales

### 1️⃣ Usuario se Autentica
```
ItGov → ?acces_token=JWT → AppComponent 
  → Decodifica con AuthService 
  → Guarda en localStorage 
  → Va a /login
```

### 2️⃣ Admin Crea Nota (Flujo: "Señalar Problema")
```
LoginComponent 
  → Click "Abrir Notas de Empleados" 
  → SenalarProblemaComponent 
  → Carga subordinados: GET /api/Usuarios/jerarquia/{id}
  → Muestra dropdown 
  → Admin selecciona empleado + categoría + descripción 
  → POST /api/Casos/crear 
  → Confirmación
```

### 3️⃣ Empleado Ve Sus Notas
```
LoginComponent 
  → Click "Ver Mis Notas" 
  → UsuarioComponent 
  → GET /api/Casos/usuario/{idUsuario} 
  → Muestra lista de notas
```

---

## 📂 Archivos Principales y Sus Funciones

| Archivo | Función |
|---------|---------|
| `app.component.ts` | 🔐 Captura token, muestra header/footer |
| `auth.service.ts` | 🔑 Decodifica JWT, maneja sesión |
| `usuarios.service.ts` | 👥 GET subordinados |
| `casos.service.ts` | 📋 CRUD de notas |
| `login.component.ts` | 👋 Bienvenida y botones de acción |
| `senalar-problema.component.ts` | ✍️ Formulario para crear notas |

---

## 🔧 Debugging

### Ver logs en consola (F12)
```typescript
// AuthService imprime:
🌐 AppComponent iniciado
🔑 TOKEN CAPTURADO desde URL: eyJ0...
💾 Token guardado en localStorage
✅ Usuario guardado: { Id: 12345, Nombre_Completo: "Juan Pérez" ... }

// SenalarProblemaComponent imprime:
📋 Respuesta completa de API: { resultados: [...] }
✅ Empleados cargados: 5
```

### ¿El dropdown no muestra empleados?
```
1. Abre Console (F12)
2. Ve los logs "📋 Respuesta completa de API"
3. Verifica que data.resultados existe
4. Si es undefined, backend devuelve estructura diferente
5. Ajusta HTML: cambiar emp.id_usuario por lo que veas en los logs
```

---

## 🚨 Errores Comunes

### ❌ "GET /api/Usuarios/jerarquia/123 404"
**Causa**: Proxy no está configurado o backend no corre en puerto 7199

**Solución**:
```bash
# Verifica proxy.conf.json apunta a puerto correcto
# Verifica que backend corre: https://localhost:7199
# Reinicia: ng serve
```

### ❌ "No se puede parsear token"
**Causa**: Token JWT está corrupto o ha expirado

**Solución**:
```bash
# Obtén un nuevo token desde ItGov
# O si estás testeando, crea uno: https://jwt.io
```

### ❌ "localStorage está vacío"
**Causa**: AppComponent no capturó el token

**Solución**:
```javascript
// Asegúrate que la URL tiene ?acces_token=...
// Si estás testeando, agrega manualmente a localStorage:
localStorage.setItem('token', 'tu-jwt-token');
localStorage.setItem('usuario', JSON.stringify({
  Id: 1, 
  Nombre_Completo: "Test User",
  Rol: "admin"
}));
// Recarga la página
```

---

## 📝 Tareas Comunes

### ➕ Agregar un nuevo servicio
```typescript
// 1. Crear: src/app/services/nuevo.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NuevoService {
  constructor(private http: HttpClient) {}
  
  obtenerDatos() {
    return this.http.get(`/api/nuevo`);
  }
}

// 2. Inyectar en componente
constructor(private nuevoService: NuevoService) {}

// 3. Usar en ngOnInit()
ngOnInit() {
  this.nuevoService.obtenerDatos().subscribe(data => { ... });
}
```

### 🎨 Cambiar color del botón
```scss
// src/app/features/login/login.component.scss
.btn-ver-notas {
  background: #0046AD;  // Azul corporativo
  
  &:hover {
    background: #003580;  // Más oscuro
  }
}
```

### ➕ Agregar campo al formulario
```html
<!-- 1. HTML: agregar input -->
<label>Nuevo Campo:</label>
<input type="text" [(ngModel)]="nuevoCaso.nuevoCampo" name="nuevoCampo">

<!-- 2. TypeScript: agregar propiedad -->
nuevoCaso: CasoCreate = {
  idUsuarioAfectado: 0,
  idCategoria: 0,
  descripcion: '',
  nuevoCampo: ''  // ← Agregar aquí
};

<!-- 3. Modelo: actualizar interface -->
// src/app/models/caso-create.model.ts
export interface CasoCreate {
  idUsuarioAfectado: number;
  idCategoria: number;
  descripcion: string;
  nuevoCampo?: string;  // ← Agregar aquí
}
```

---

## 🧪 Testing Manual

### Test 1: Autenticación
```
✅ Abre: http://localhost:4200?acces_token=eyJ0...
✅ Ve el LoginComponent con tus datos
✅ Logs en console muestran token decodificado
✅ localStorage tiene 'token' y 'usuario'
```

### Test 2: Crear Nota
```
✅ Click "Abrir Notas de Empleados"
✅ El dropdown muestra empleados
✅ Selecciona un empleado + categoría + descripción
✅ Click "Guardar"
✅ Alert dice "Caso creado correctamente"
```

### Test 3: Ver Mis Notas
```
✅ Click "Ver Mis Notas"
✅ UsuarioComponent muestra notas del usuario
✅ Cada nota muestra: empleado, categoría, fecha
```

---

## 📞 Preguntas Frecuentes

**P: ¿Dónde se guardan las notas?**
R: En la base de datos del backend (Visual Studio)

**P: ¿Cuándo expira el token?**
R: La propiedad `exp` en el JWT dice cuándo expira. AuthService.isTokenExpired() lo valida.

**P: ¿Puedo crear una nota de otro jefe?**
R: No, solo ves tus subordinados. El backend valida esto también.

**P: ¿Dónde están las categorías?**
R: Hardcodeadas en SenalarProblemaComponent.categorias. TODO: traer del backend.

**P: ¿Cómo cambio el título?**
R: Está en app.component.ts template: `<div class="logo">📘 Notas Disciplinarias</div>`

---

## 🔗 Referencias Rápidas

```typescript
// Obtener usuario actual
const usuario = this.authService.getTokenInfo();
console.log(usuario.Nombre_Completo);

// Leer localStorage
const token = localStorage.getItem('token');

// Hacer petición GET
this.http.get('/api/endpoint').subscribe(data => { ... });

// Hacer petición POST
this.http.post('/api/endpoint', payload).subscribe(data => { ... });

// Navegar a otra ruta
this.router.navigate(['/ruta']);

// Mostrar mensaje
alert('Tu mensaje');
console.log('Debug info');
```

---

**¿Necesitas ayuda?** Revisa los comentarios en los archivos .ts y .html 📝