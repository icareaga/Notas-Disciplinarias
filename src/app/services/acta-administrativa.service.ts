import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ActaAdministrativaCierreDto,
  ActaAdministrativaCreateDto,
  ActaAdministrativaResponse
} from '../models/acta-administrativa.model';

/**
 * Servicio para gestionar el Paso 6: Acta Administrativa
 *
 * Endpoints esperados (backend):
 * - GET  /api/ActaAdministrativa/{idCaso}
 * - POST /api/ActaAdministrativa              (upsert por id_caso)
 * - PUT  /api/ActaAdministrativa/{idPaso6}/completar
 * - PUT  /api/ActaAdministrativa/{idPaso6}/cerrar   (opcional)
 */
@Injectable({
  providedIn: 'root'
})
export class ActaAdministrativaService {
  private apiUrl = `${environment.apiUrl}/ActaAdministrativa`;

  constructor(private http: HttpClient) {}

  obtenerPorCaso(idCaso: number): Observable<ActaAdministrativaResponse> {
    return this.http.get<ActaAdministrativaResponse>(`${this.apiUrl}/${idCaso}`);
  }

  guardarPaso6(dto: ActaAdministrativaCreateDto): Observable<ActaAdministrativaResponse> {
    return this.http.post<ActaAdministrativaResponse>(this.apiUrl, dto);
  }

  completarPaso6(idPaso6: number): Observable<{ message: string; id_paso_actual?: number }>{
    return this.http.put<{ message: string; id_paso_actual?: number }>(`${this.apiUrl}/${idPaso6}/completar`, {});
  }

  cerrarPaso6(idPaso6: number, dto: ActaAdministrativaCierreDto): Observable<{ message: string; id_paso_actual?: number }>{
    return this.http.put<{ message: string; id_paso_actual?: number }>(`${this.apiUrl}/${idPaso6}/cerrar`, dto);
  }
}
