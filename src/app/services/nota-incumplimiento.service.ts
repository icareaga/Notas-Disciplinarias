import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  NotaIncumplimientoCierreDto,
  NotaIncumplimientoCreateDto,
  NotaIncumplimientoResponse
} from '../models/nota-incumplimiento.model';

/**
 * Servicio para gestionar el Paso 5: Nota de Incumplimiento
 *
 * Endpoints esperados (backend):
 * - GET  /api/NotaIncumplimiento/{idCaso}
 * - POST /api/NotaIncumplimiento              (upsert por id_caso)
 * - PUT  /api/NotaIncumplimiento/{idPaso5}/completar
 * - PUT  /api/NotaIncumplimiento/{idPaso5}/cerrar   (opcional)
 */
@Injectable({
  providedIn: 'root'
})
export class NotaIncumplimientoService {
  private apiUrl = `${environment.apiUrl}/NotaIncumplimiento`;

  constructor(private http: HttpClient) {}

  obtenerPorCaso(idCaso: number): Observable<NotaIncumplimientoResponse> {
    return this.http.get<NotaIncumplimientoResponse>(`${this.apiUrl}/${idCaso}`);
  }

  guardarPaso5(datos: NotaIncumplimientoCreateDto): Observable<NotaIncumplimientoResponse> {
    return this.http.post<NotaIncumplimientoResponse>(this.apiUrl, datos);
  }

  completarPaso5(idPaso5: number): Observable<{ message: string; id_paso_actual: number }> {
    return this.http.put<{ message: string; id_paso_actual: number }>(`${this.apiUrl}/${idPaso5}/completar`, {});
  }

  cerrarPaso5(idPaso5: number, dto: NotaIncumplimientoCierreDto): Observable<{ message: string; id_paso_actual?: number }> {
    return this.http.put<{ message: string; id_paso_actual?: number }>(`${this.apiUrl}/${idPaso5}/cerrar`, dto);
  }
}
