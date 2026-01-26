# 📡 Documentación de API - Backend .NET

## Base URL
```
Desarrollo:  https://localhost:7199/api
Producción:  https://api-produccion.megacable.com.mx/api
```

---

## 🔐 Autenticación

Todas las peticiones requieren **Bearer Token** en el header:

```http
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

El token es proporcionado por **ItGov** y contiene:
- `Id` / `UserId`: ID del usuario
- `Nombre_Completo`: Nombre completo
- `Correo`: Email corporativo
- `Rol`: Rol del usuario (admin, jefe, empleado)
- `PlazaJefe`: ID de plaza del jefe
- `exp`: Timestamp de expiración

---

## 📋 Endpoints

### 1️⃣ **Casos (Notas Disciplinarias)**

#### **POST /api/Casos/crear**
Crea una nueva nota disciplinaria.

**Request Body:**
```json
{
  "IdUsuario": 101,
  "id_categoria": 5,
  "descripcion": "El empleado llegó 30 minutos tarde sin justificación",
  "impacto": "Retraso en la entrega del proyecto al cliente",
  "conducta": "Llegó a las 9:30 AM cuando su hora de entrada es 9:00 AM",
  "id_usuario_jefe": 12345,
  "estatus": 1,
  "id_paso": 2
}
```

**Campos:**
| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `IdUsuario` | `int` | ✅ | ID del empleado afectado |
| `id_categoria` | `int` | ✅ | ID de la categoría (tipo de falta) |
| `descripcion` | `string` | ✅ | Descripción detallada del problema |
| `impacto` | `string` | ✅ | Impacto en la empresa |
| `conducta` | `string` | ✅ | Conducta observada |
| `id_usuario_jefe` | `int` | ✅ | ID del jefe que crea la nota |
| `estatus` | `int` | ❌ | 1=Activo (default), 0=Cerrado |
| `id_paso` | `int` | ❌ | Paso actual (1-6). En este frontend suele enviarse 2 (listo para Paso 2) al terminar Paso 1 |

**Response 200 OK:**
```json
{
  "id": 999,
  "mensaje": "Caso creado exitosamente",
  "id_caso": 999,
  "fecha_registro": "2026-01-23T14:30:00"
}
```

**Errores:**
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Empleado o categoría no encontrados
- `500 Internal Server Error`: Error en el servidor

---

#### **GET /api/admin/casos**
Obtiene casos (activos + cerrados) del jefe autenticado o de un usuario específico.

> El frontend intenta primero este endpoint y, si el backend responde `404`, hace fallback a `/api/admin/casos-activos`.

**Query Parameters:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `idJefe` | `int` | ❌ | Filtra casos creados por este jefe |
| `idUsuario` | `int` | ❌ | Filtra casos del empleado afectado |

**Ejemplos:**
```http
# Casos del jefe (incluye cerrados)
GET /api/admin/casos?idJefe=12345

# Casos de un empleado (incluye cerrados)
GET /api/admin/casos?idUsuario=101
```

---

#### **GET /api/admin/casos-activos**
Obtiene casos activos del jefe autenticado o de un usuario específico (fallback/compatibilidad).

**Query Parameters:**
| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| `idJefe` | `int` | ❌ | Filtra casos creados por este jefe |
| `idUsuario` | `int` | ❌ | Filtra casos del empleado afectado |

**Ejemplos:**
```http
# Todos los casos del jefe autenticado
GET /api/admin/casos-activos?idJefe=12345

# Casos de un empleado específico
GET /api/admin/casos-activos?idUsuario=101
```

**Response 200 OK:**
```json
[
  {
    "id_caso": 1,
    "id_usuario": 101,
    "nombre_empleado": "Juan Pérez García",
    "id_usuario_jefe": 12345,
    "categoria": "Retardo",
    "descripcion": "Llegó 30 minutos tarde",
    "impacto": "Retraso en entrega",
    "conducta": "Llegó a las 9:30 AM",
    "fecha_registro": "2026-01-15T08:00:00",
    "estatus": 1,
    "id_paso": 1
  },
  {
    "id_caso": 2,
    "id_usuario": 102,
    "nombre_empleado": "María López Ruiz",
    "id_usuario_jefe": 12345,
    "categoria": "Baja Productividad",
    "descripcion": "No cumplió metas del mes",
    "impacto": "Afectó KPIs del área",
    "conducta": "Solo completó 60% de tareas asignadas",
    "fecha_registro": "2026-01-20T10:00:00",
    "estatus": 1,
    "id_paso": 2
  }
]
```

**Campos de Respuesta:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_caso` | `int` | ID único del caso |
| `id_usuario` | `int` | ID del empleado afectado |
| `nombre_empleado` | `string` | Nombre completo del empleado (JOIN) |
| `id_usuario_jefe` | `int` | ID del jefe que creó el caso |
| `categoria` | `string` | Nombre de la categoría |
| `descripcion` | `string` | Descripción del problema |
| `impacto` | `string` | Impacto en la empresa |
| `conducta` | `string` | Conducta observada |
| `fecha_registro` | `datetime` | Fecha de creación |
| `estatus` | `int` | 1=Activo, 0=Cerrado |
| `id_paso` | `int` | Paso actual (1-6) |

---

#### **GET /api/casos/{id}/pdf**
Descarga el PDF de un caso específico.

**Response 200 OK:**
- Content-Type: `application/pdf`
- Retorna un blob binario del PDF

**Ejemplo de uso en Angular:**
```typescript
this.casosService.descargarPDF(999).subscribe((blob: Blob) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Caso_999.pdf`;
  a.click();
  window.URL.revokeObjectURL(url);
});
```

---

### 2️⃣ **Usuarios y Jerarquía**

#### **GET /api/Usuarios/jerarquia/{plazaRaiz}**
Obtiene los empleados subordinados de un jefe.

**Path Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `plazaRaiz` | `string` | ID del jefe (plaza raíz) |

**Ejemplo:**
```http
GET /api/Usuarios/jerarquia/12345
```

**Response 200 OK:**
```json
{
  "resultados": [
    {
      "id": 101,
      "id_usuario": 101,
      "id_emple_completo": 101,
      "nombre_Completo": "Juan Pérez García",
      "correo": "juan.perez@megacable.com.mx",
      "plaza": "114683",
      "departamento": "Ventas",
      "puesto": "Ejecutivo de Ventas"
    },
    {
      "id": 102,
      "id_usuario": 102,
      "id_emple_completo": 102,
      "nombre_Completo": "María López Ruiz",
      "correo": "maria.lopez@megacable.com.mx",
      "plaza": "114684",
      "departamento": "Ventas",
      "puesto": "Ejecutivo de Ventas"
    }
  ]
}
```

**Nota:** El backend devuelve múltiples formatos de ID (`id`, `id_usuario`, `id_emple_completo`) por compatibilidad con sistemas legacy.

---

#### **GET /api/Usuarios/todos**
Obtiene todos los usuarios del sistema (solo admins).

**Response 200 OK:**
```json
[
  {
    "id": 12345,
    "nombre_Completo": "Admin Usuario",
    "correo": "admin@megacable.com.mx",
    "rol": "admin",
    "activo": true
  },
  {
    "id": 101,
    "nombre_Completo": "Juan Pérez",
    "correo": "juan@megacable.com.mx",
    "rol": "empleado",
    "activo": true
  }
]
```

---

### 3️⃣ **Categorías**

#### **GET /api/Categorias**
Obtiene el catálogo completo de categorías (tipos de faltas).

**Response 200 OK:**
```json
[
  {
    "id_Categoria": 1,
    "nombre": "Agresión Física",
    "descripcion": "Uso de fuerza física contra compañeros o superiores"
  },
  {
    "id_Categoria": 2,
    "nombre": "Baja Productividad",
    "descripcion": "No cumple con las metas establecidas"
  },
  {
    "id_Categoria": 3,
    "nombre": "Comunicación y respeto",
    "descripcion": "Falta de respeto en la comunicación"
  },
  {
    "id_Categoria": 4,
    "nombre": "Desvío de rutas",
    "descripcion": "No seguir las rutas asignadas"
  },
  {
    "id_Categoria": 5,
    "nombre": "Retardo",
    "descripcion": "Llegadas tardías al trabajo"
  }
]
```

**Nota:** Las categorías son relativamente estáticas y pueden ser cacheadas en el frontend.

---

## 🔄 Flujo Completo de Creación de Caso

```mermaid
sequenceDiagram
    participant F as Frontend Angular
    participant I as Auth Interceptor
    participant B as Backend .NET
    participant DB as SQL Server

    F->>F: Usuario completa formulario
    F->>I: POST /api/Casos/crear
    I->>I: Agrega header Authorization
    I->>B: HTTP Request con token
    B->>B: Valida JWT token
    B->>DB: INSERT INTO Casos
    DB-->>B: ID del caso generado
    B-->>I: { id: 999, mensaje: "Creado" }
    I-->>F: Response
    F->>F: Muestra alerta de éxito
```

---

## 🛡️ Seguridad

### **Validaciones Backend:**
1. **Token JWT válido** en todas las peticiones
2. **Expiración del token** verificada
3. **Rol del usuario** validado para operaciones
4. **SQL Injection** prevenido con parámetros
5. **XSS** prevenido con sanitización
6. **CORS** configurado solo para dominios permitidos

### **Headers de Seguridad:**
```http
Access-Control-Allow-Origin: https://notas.megacable.com.mx
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

---

## 🐛 Códigos de Error

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400` | Bad Request - Datos inválidos | Verificar formato de JSON y tipos de datos |
| `401` | Unauthorized - Token inválido | Renovar token desde ItGov |
| `403` | Forbidden - Sin permisos | Verificar rol del usuario |
| `404` | Not Found - Recurso no existe | Verificar IDs de empleado/categoría |
| `409` | Conflict - Duplicado | El caso ya existe |
| `422` | Unprocessable Entity - Validación fallida | Verificar reglas de negocio |
| `500` | Internal Server Error | Contactar soporte backend |
| `503` | Service Unavailable - BD caída | Esperar restauración |

---

## 📊 Rate Limiting

Para evitar abuso:
- **100 requests por minuto** por usuario
- **500 requests por minuto** por IP
- Si se excede: HTTP 429 Too Many Requests

---

## 🧪 Testing con Postman

### **Colección de Postman:**

```json
{
  "info": {
    "name": "Notas Disciplinarias API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Crear Caso",
      "request": {
        "method": "POST",
        "header": [],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"IdUsuario\": 101,\n  \"id_categoria\": 5,\n  \"descripcion\": \"Test\",\n  \"impacto\": \"Test\",\n  \"conducta\": \"Test\",\n  \"id_usuario_jefe\": 12345,\n  \"estatus\": 1,\n  \"id_paso\": 1\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "{{base_url}}/Casos/crear",
          "host": ["{{base_url}}"],
          "path": ["Casos", "crear"]
        }
      }
    }
  ]
}
```

---

## 📞 Contacto Backend

**Responsable:** Equipo Backend .NET
**Email:** backend-team@megacable.com.mx
**Documentación Swagger:** https://localhost:7199/swagger
