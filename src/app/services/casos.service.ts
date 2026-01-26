// ...
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CasoCreate } from '../models/caso-create.model';
import { environment } from '../../environments/environment';

/**
 * CASOSSERVICE - Gestión de notas disciplinarias (casos)
 * 
 * Responsabilidades:
 * - Crear nuevas notas disciplinarias
 * - Obtener casos activos para administradores
 * - Obtener casos por usuario (mis notas)
 * - Descargar PDF de un caso
 * 
 * Flujo de creación:
 * 1. SenalarProblemaComponent construye CasoCreate con: idUsuarioAfectado, idCategoria, descripción
 * 2. crearCaso() envía POST a /api/Casos/crear
 * 3. Backend genera la nota y retorna { id, status }
 * 4. Usuario ve confirmación
 * 
 * Flujo de consulta (admin):
 * - obtenerCasos() para ver todas las notas activas
 * 
 * Flujo de consulta (empleado):
 * - obtenerCasosPorUsuario(id) para ver sus propias notas
 */
@Injectable({
  providedIn: 'root'
})
export class CasosService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los pasos de un caso específico
   * @param idCaso - ID del caso
   * @returns Observable con array de pasos
   */
  obtenerPasosPorCaso(idCaso: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/casos/caso/${idCaso}/pasos`);
  }

  

  /**
   * CREAR NUEVA NOTA DISCIPLINARIA (API CALL)
   * 
   * Este es el método más importante del servicio.
   * Envía los datos del formulario al backend para guardar en base de datos.
   * 
   * CONVERSIÓN DE FORMATO:
   * El backend .NET espera propiedades en snake_case o PascalCase,
   * pero el frontend usa camelCase. Este método hace la conversión automática.
   * 
   * MAPEO DE CAMPOS:
   * Frontend (camelCase)     →  Backend (snake_case/PascalCase)
   * ─────────────────────────────────────────────────────────────
   * caso.idUsuario           →  IdUsuario
   * caso.idCategoria         →  id_categoria    (snake_case por [JsonPropertyName])
   * caso.descripcion         →  descripcion     (minúscula por [JsonPropertyName])
   * caso.impacto             →  impacto         (minúscula por [JsonPropertyName])
   * caso.conducta            →  conducta        (minúscula por [JsonPropertyName])
   * caso.idUsuarioJefe       →  id_usuario_jefe (snake_case por [JsonPropertyName])
   * caso.estatus             →  estatus         (1 = Activo por defecto)
   * caso.idPaso              →  id_paso         (SIEMPRE 1: primer paso de 6)
   * 
   * @param caso - Interface CasoCreate con los datos del formulario
   * @returns Observable<any> con respuesta del servidor:
   * {
   *   "id": 999,                     // ID del caso creado
   *   "mensaje": "Caso creado exitosamente",
   *   "id_caso": 999,                // ID duplicado (compatibilidad)
   *   "fecha_registro": "2026-01-23T14:30:00"
   * }
   * 
   * ERRORES POSIBLES:
   * - 400 Bad Request: Datos inválidos (campos faltantes, tipos incorrectos)
   * - 401 Unauthorized: Token JWT inválido o expirado
   * - 404 Not Found: Empleado o categoría no existen en BD
   * - 500 Internal Server Error: Error del servidor o BD
   * 
   * EJEMPLO DE USO:
   * ```typescript
   * const nuevoCaso: CasoCreate = {
   *   idUsuario: 101,
   *   idCategoria: 5,
   *   descripcion: 'Llegó 30 minutos tarde',
   *   impacto: 'Retraso en entrega al cliente',
   *   conducta: 'Llegó a las 9:30 AM',
   *   idUsuarioJefe: 12345,
   *   estatus: 1,
   *   idPaso: 1
   * };
   * 
   * this.casosService.crearCaso(nuevoCaso).subscribe({
   *   next: (resp) => alert('Caso creado con ID: ' + resp.id),
   *   error: (err) => alert('Error: ' + err.error.message)
   * });
   * ```
   * 
   * LOGS DE DEBUGGING:
   * - Se imprimen en consola los datos originales (camelCase)
   * - Se imprimen los datos convertidos (snake_case) antes de enviar
   * - Esto facilita identificar problemas de formato
   */
  crearCaso(caso: CasoCreate): Observable<any> {
    // Enviar con los nombres exactos que espera el DTO del backend
    const casoApi = {
      IdUsuario: caso.idUsuario,
      id_categoria: caso.idCategoria, // ✅ snake_case por JsonPropertyName
      descripcion: caso.descripcion,  // ✅ minúscula por JsonPropertyName
      impacto: caso.impacto,          // ✅ minúscula por JsonPropertyName
      conducta: caso.conducta,        // ✅ minúscula por JsonPropertyName
      id_usuario_jefe: caso.idUsuarioJefe ?? 0,
      estatus: caso.estatus ?? 1,
      // Al guardar Paso 1 (Señalar Problema), el caso queda listo para Paso 2
      id_paso: Math.max(Number(caso.idPaso ?? 1), 2)
    };
    
    console.log('📤 Enviando (camelCase original):', caso);
    console.log('📤 Enviando (API convertido):', casoApi);
    return this.http.post(`${this.apiUrl}/Casos/crear`, casoApi);
  }

  /**
   * Actualiza los datos del Paso 1 (tabla Casos) y mantiene/avanza el id_paso.
   * Requiere backend: PUT /api/Casos/{idCaso}
   */
  actualizarCasoPaso1(idCaso: number, caso: CasoCreate): Observable<any> {
    const casoApi = {
      IdUsuario: caso.idUsuario,
      id_categoria: caso.idCategoria,
      descripcion: caso.descripcion,
      impacto: caso.impacto,
      conducta: caso.conducta,
      id_usuario_jefe: caso.idUsuarioJefe ?? 0,
      estatus: caso.estatus ?? 1,
      id_paso: Math.max(Number(caso.idPaso ?? 1), 2)
    };

    return this.http.put(`${this.apiUrl}/Casos/${idCaso}`, casoApi);
  }

  /**
   * Obtiene notas disciplinarias del JEFE LOGUEADO.
   *
   * Preferimos un endpoint que incluya activos + cerrados:
   * - GET /api/admin/casos?idJefe=123
   *
   * Pero mantenemos compatibilidad con el endpoint anterior:
   * - GET /api/admin/casos-activos?idJefe=123
   * @param idJefe - ID del jefe (obtenido del token)
   * @returns Observable con array de casos
   */
  obtenerCasos(idJefe?: number): Observable<any[]> {
    const allUrl = idJefe
      ? `${this.apiUrl}/admin/casos?idJefe=${idJefe}`
      : `${this.apiUrl}/admin/casos`;

    const activosUrl = idJefe
      ? `${this.apiUrl}/admin/casos-activos?idJefe=${idJefe}`
      : `${this.apiUrl}/admin/casos-activos`;

    return this.http.get<any[]>(allUrl).pipe(
      catchError((err) => {
        // Si el backend aún no tiene /admin/casos, hacemos fallback.
        if (err?.status === 404) {
          return this.http.get<any[]>(activosUrl);
        }
        throw err;
      })
    );
  }

  /**
   * Obtiene las notas disciplinarias de un usuario específico
   * Usado cuando el usuario quiere ver sus propias notas
   * @param idUsuario - ID del usuario empleado
   * @returns Observable con array de casos donde el usuario es el afectado
   */
  obtenerCasosPorUsuario(idUsuario: number): Observable<any[]> {
    const allUrl = `${this.apiUrl}/admin/casos?idUsuario=${idUsuario}`;
    const activosUrl = `${this.apiUrl}/admin/casos-activos?idUsuario=${idUsuario}`;

    return this.http.get<any[]>(allUrl).pipe(
      catchError((err) => {
        if (err?.status === 404) {
          return this.http.get<any[]>(activosUrl);
        }
        throw err;
      })
    );
  }

  /**
   * Obtiene los detalles de un caso específico por su ID
   * Usado cuando se necesita cargar la información completa de un caso para editarlo
   * @param id - ID del caso a obtener
   * @returns Observable con los datos del caso
   * 
   * NOTA: Como el backend no tiene endpoint GET /Casos/{id}, 
   * obtenemos todos los casos y filtramos por ID en memoria
   */
  obtenerCasoPorId(id: number): Observable<any> {
    return this.obtenerCasos().pipe(
      map((casos: any[]) => {
        const caso = casos.find(c => c.id_caso === id || c.IdCaso === id || c.idCaso === id || c.id === id);
        if (!caso) {
          throw new Error(`Caso con ID ${id} no encontrado`);
        }
        return caso;
      }),
      catchError((err) => {
        // Mantener el tipo Observable<any>
        throw err;
      })
    );
  }

  /**
   * Descarga el PDF de una nota disciplinaria
   * @param id - ID del caso
   * @returns Observable con blob del PDF
   */
  descargarPDF(id: number) {
    return this.http.get(`${this.apiUrl}/casos/${id}/pdf`, { responseType: 'blob' });
  }

}
