# 📊 Diccionario de Datos y Modelos

## 1️⃣ UsuarioInfo (Decodificado del JWT)

**Ubicación**: `src/app/services/auth.service.ts`

```typescript
interface UsuarioInfo {
  // IDs (puede venir como Id o UserId)
  Id?: number | string;
  UserId?: number | string;
  
  // Nombre del usuario (puede venir en 2 formatos)
  Nombre?: string;
  Nombre_Completo?: string;
  
  // Email (puede venir con acentos o sin)
  Correo?: string;
  Email?: string;
  
  // Rol/Puesto (puede venir con mayúscula R o r)
  Rol?: string;
  Role?: string;
  
  // Organización
  Area?: string;
  Departamento?: string;
  
  // Jerarquía (ID de la plaza/supervisor)
  Plaza?: string;
  PlazaJefe?: string;
  
  // JWT metadata
  exp?: number;  // Timestamp unix en segundos (cuándo expira)
  iat?: number;  // Timestamp unix en segundos (cuándo se emitió)
  
  // Cualquier otra propiedad del token
  [key: string]: unknown;
}
```

**¿De dónde viene?** Del JWT decodificado por `jwtDecode(token)`

**¿Quién lo crea?** `AuthService.getTokenInfo()`

**Ejemplo real**:
```json
{
  "Id": 12345,
  "Nombre_Completo": "Juan Pérez García",
  "Correo": "juan@megacable.com",
  "Rol": "admin",
  "Area": "Tecnologías",
  "Departamento": "Infraestructura",
  "Plaza": "114682",
  "PlazaJefe": "114687",
  "exp": 1705800000,
  "iat": 1705713600
}
```

---

## 2️⃣ CasoCreate (Crear Nota Disciplinaria)

**Ubicación**: `src/app/models/caso-create.model.ts`

```typescript
export interface CasoCreate {
  /** ID del empleado a quien va la nota */
  idUsuarioAfectado: number;
  
  /** ID/índice de la categoría (tipo de incumplimiento) */
  idCategoria: number;
  
  /** Descripción del problema detectado */
  descripcion: string;
}
```

**¿De dónde viene?** Lo crea el jefe en `SenalarProblemaComponent`

**¿Dónde se envía?** POST a `/api/Casos/crear`

**Ejemplo**:
```json
{
  "idUsuarioAfectado": 101,
  "idCategoria": 15,
  "descripcion": "El empleado llegó 30 minutos tarde el 15/01/2026 sin justificación"
}
```

---

## 3️⃣ Caso (Respuesta del Backend)

**Ubicación**: Backend (Visual Studio)

**¿Qué es?** La nota disciplinaria guardada en base de datos

```typescript
interface Caso {
  id: number;                          // ID único de la nota
  idUsuarioAfectado: number;           // Quién es el afectado
  idUsuarioCreador: number;            // Quién la creó (jefe)
  idCategoria: number;                 // Tipo de incumplimiento
  descripcion: string;                 // Detalles
  fechaCreacion: string;               // ISO date
  estado: "activa" | "resuelta" | "archivada";
  prioridad: "baja" | "media" | "alta";
  // ... otros campos
}
```

**Ejemplo**:
```json
{
  "id": 999,
  "idUsuarioAfectado": 101,
  "idUsuarioCreador": 12345,
  "idCategoria": 15,
  "descripcion": "Retardo sin justificación",
  "fechaCreacion": "2026-01-20T14:30:00",
  "estado": "activa",
  "prioridad": "media"
}
```

---

## 4️⃣ Categoria (Tipo de Incumplimiento)

**Ubicación**: Backend o hardcodeado en `SenalarProblemaComponent`

```typescript
interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}
```

**Listado actual** (hardcodeado):
```
1. Agresión Física
2. Baja Productividad
3. Comunicación y respeto
4. Desvío de rutas
5. Falsificación de Información, documentos y/o firmas
...
25. Retardos
```

**Respuesta esperada de `/api/Categorias`**:
```json
[
  {
    "id": 1,
    "nombre": "Agresión Física",
    "descripcion": "Uso de fuerza contra compañeros o superiores"
  },
  {
    "id": 2,
    "nombre": "Baja Productividad",
    "descripcion": "No cumple con metas establecidas"
  }
]
```

---

## 5️⃣ Empleado (Subordinado del Jefe)

**Ubicación**: Respuesta de `/api/Usuarios/jerarquia/{idUsuario}`

```typescript
interface Empleado {
  idUsuario: number;           // ID del empleado
  nombreCompleto: string;      // Nombre completo
  correo?: string;             // Email
  plaza?: string;              // Plaza/posición
  departamento?: string;       // Área
  // ... otros datos
}
```

**Respuesta esperada**:
```json
{
  "resultados": [
    {
      "idUsuario": 101,
      "nombreCompleto": "María López García",
      "correo": "maria@megacable.com",
      "plaza": "114683",
      "departamento": "Ventas"
    },
    {
      "idUsuario": 102,
      "nombreCompleto": "Carlos Ruiz Pérez",
      "correo": "carlos@megacable.com",
      "plaza": "114684",
      "departamento": "Ventas"
    }
  ]
}
```

---

## 🔄 Flujo de Datos (Paso a Paso)

### Paso 1: Usuario se autentica
```
ItGov envía: ?acces_token=eyJ0...
        ↓
AppComponent decodifica con jwtDecode()
        ↓
Obtiene UsuarioInfo
        ↓
Guarda en localStorage
```

### Paso 2: Admin abre Señalar Problema
```
SenalarProblemaComponent.ngOnInit()
        ↓
Lee UsuarioInfo de localStorage
        ↓
Obtiene su ID
        ↓
GET /api/Usuarios/jerarquia/{id}
        ↓
Recibe: { resultados: [Empleado, Empleado, ...] }
        ↓
Muestra dropdown
```

### Paso 3: Admin crea nota
```
Admin selecciona: Empleado + Categoría + Descripción
        ↓
Crea objeto CasoCreate
        ↓
POST /api/Casos/crear { CasoCreate }
        ↓
Backend valida y guarda
        ↓
Retorna: { id: 999, status: "creado" }
        ↓
Frontend muestra: ¡Caso creado correctamente!
```

---

## 📋 Validaciones

### CasoCreate
- ✅ idUsuarioAfectado > 0 (no puede ser 0)
- ✅ idCategoria > 0 (no puede ser 0)
- ✅ descripcion.trim().length > 0 (no puede estar vacío)

### UsuarioInfo
- ✅ Id debe existir
- ✅ exp debe ser > ahora (no expirado)

---

## 🗄️ LocalStorage Keys

```javascript
localStorage.getItem('token')        // String: JWT completo
localStorage.getItem('usuario')      // String JSON: UsuarioInfo parseado

// Ejemplo de contenido
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "usuario": {
    "Id": 12345,
    "Nombre_Completo": "Juan Pérez",
    ...
  }
}
```

---

## 🔗 Mapeo de Propiedades Normalizadas

**AuthService normaliza estos campos** (porque ItGov puede enviarlos con diferentes nombres):

| Canonical | Alternativa 1 | Alternativa 2 | Normalizador |
|-----------|---------------|---------------|--------------|
| Id | UserId | - | `decoded.UserId \|\| decoded.Id` |
| Nombre_Completo | Nombre | - | `decoded.Nombre_Completo \|\| decoded.Nombre` |
| Correo | Email | - | `decoded.Correo \|\| decoded.Email` |
| Rol | Role | - | `decoded.Rol \|\| decoded.Role` |

**Por qué?** Diferentes sistemas pueden enviar el JWT con variaciones de nombres

---

## 🆚 Comparación: Request vs Response

### Crear Nota
```
REQUEST (CasoCreate)              RESPONSE (Caso)
{                                 {
  idUsuarioAfectado: 101    →       id: 999,
  idCategoria: 15           →       idUsuarioAfectado: 101,
  descripcion: "..."        →       idCategoria: 15,
                            →       descripcion: "...",
                            →       fechaCreacion: "2026-01-20",
                            →       estado: "activa"
                            →     }
}
```

---

## 📌 Checklist de Entendimiento

- [ ] ¿Qué es UsuarioInfo? → Datos del usuario extraídos del JWT
- [ ] ¿De dónde vienen? → ItGov lo envía en la URL como token JWT
- [ ] ¿Cómo se decodifica? → `jwtDecode()` en AuthService
- [ ] ¿Dónde se guardan? → localStorage (token + usuario parseado)
- [ ] ¿Qué es CasoCreate? → El objeto que envía el frontend para crear nota
- [ ] ¿Cómo se envía? → POST /api/Casos/crear con CasoCreate
- [ ] ¿Qué retorna? → Caso (la nota guardada en BD)
- [ ] ¿Qué es Empleado? → Un subordinado del jefe autenticado
- [ ] ¿Cómo se obtienen? → GET /api/Usuarios/jerarquia/{idUsuario}
- [ ] ¿Qué es Categoria? → Tipo de incumplimiento (Retardo, Agresión, etc.)