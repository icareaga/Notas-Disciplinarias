import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
   * Crea una nueva nota disciplinaria
   * @param caso - Objeto con idUsuario, idCategoria, descripcion, impacto, conducta
   * @returns Observable con respuesta del servidor
   * 
   * IMPORTANTE: Convierte de camelCase (TypeScript) a PascalCase (.NET)
   * Entrada: { idUsuario: 123, idCategoria: 5, descripcion: "...", impacto: "...", conducta: "..." }
   * Envío: { IdUsuario: 123, IdCategoria: 5, Descripcion: "...", Impacto: "...", Conducta: "..." }
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
      id_paso: 1 // SIEMPRE 1: Primer paso de 6 pasos
    };
    
    console.log('📤 Enviando (camelCase original):', caso);
    console.log('📤 Enviando (API convertido):', casoApi);
    return this.http.post(`${this.apiUrl}/Casos/crear`, casoApi);
  }

  /**
   * Obtiene TODAS las notas disciplinarias activas DEL JEFE LOGUEADO
   * @param idJefe - ID del jefe (obtenido del token)
   * @returns Observable con array de casos
   */
  obtenerCasos(idJefe?: number): Observable<any[]> {
    if (idJefe) {
      return this.http.get<any[]>(`${this.apiUrl}/admin/casos-activos?idJefe=${idJefe}`);
    }
    return this.http.get<any[]>(`${this.apiUrl}/admin/casos-activos`);
  }

  /**
   * Obtiene las notas disciplinarias de un usuario específico
   * Usado cuando el usuario quiere ver sus propias notas
   * @param idUsuario - ID del usuario empleado
   * @returns Observable con array de casos donde el usuario es el afectado
   */
  obtenerCasosPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/casos-activos?idUsuario=${idUsuario}`);
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
