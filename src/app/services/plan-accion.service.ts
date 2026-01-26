import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PlanAccionCierreDto, PlanAccionCreateDto, PlanAccionResponse } from '../models/plan-accion.model';

/**
 * Servicio para gestionar el Paso 3: Plan de Acción
 *
 * Endpoints esperados (backend):
 * - GET  /api/PlanAccion/{idCaso}
 * - POST /api/PlanAccion             (upsert por id_caso)
 * - PUT  /api/PlanAccion/{idPaso3}/completar
 */
@Injectable({
  providedIn: 'root'
})
export class PlanAccionService {
  private apiUrl = `${environment.apiUrl}/PlanAccion`;

  constructor(private http: HttpClient) {}

  obtenerPorCaso(idCaso: number): Observable<PlanAccionResponse> {
    return this.http.get<PlanAccionResponse>(`${this.apiUrl}/${idCaso}`);
  }

  guardarPaso3(datos: PlanAccionCreateDto): Observable<PlanAccionResponse> {
    return this.http.post<PlanAccionResponse>(this.apiUrl, datos);
  }

  completarPaso3(idPaso3: number): Observable<{ message: string; id_paso_actual: number }> {
    return this.http.put<{ message: string; id_paso_actual: number }>(
      `${this.apiUrl}/${idPaso3}/completar`,
      {}
    );
  }

    cerrarPaso3(
      idPaso3: number,
      dto: PlanAccionCierreDto
    ): Observable<{ message: string; id_paso_actual?: number }> {
      return this.http.put<{ message: string; id_paso_actual?: number }>(`${this.apiUrl}/${idPaso3}/cerrar`, dto);
    }
}
