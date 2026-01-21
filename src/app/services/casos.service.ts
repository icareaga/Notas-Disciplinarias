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
   * @param caso - Objeto con idUsuarioAfectado, idCategoria, descripción
   * @returns Observable con respuesta del servidor
   */
  crearCaso(caso: CasoCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/Casos/crear`, caso);
  }

  /**
   * Obtiene TODAS las notas disciplinarias activas (solo para admin)
   * @returns Observable con array de casos
   */
  obtenerCasos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/casos-activos`);
  }

  /**
   * Obtiene las notas disciplinarias de un usuario específico
   * Usado cuando el usuario quiere ver sus propias notas
   * @param idUsuario - ID del usuario
   * @returns Observable con array de casos del usuario
   */
  obtenerCasosPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Casos/usuario/${idUsuario}`);
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
