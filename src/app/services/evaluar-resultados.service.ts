import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EvaluarResultadosCierreDto,
  EvaluarResultadosCreateDto,
  EvaluarResultadosResponse
} from '../models/evaluar-resultados.model';

/**
 * Servicio para gestionar el Paso 4: Evaluar Resultados
 *
 * Endpoints esperados (backend):
 * - GET  /api/EvaluarResultados/{idCaso}
 * - POST /api/EvaluarResultados              (upsert por id_caso)
 * - PUT  /api/EvaluarResultados/{idPaso4}/completar
 * - PUT  /api/EvaluarResultados/{idPaso4}/cerrar   (opcional)
 */
@Injectable({
  providedIn: 'root'
})
export class EvaluarResultadosService {
  private apiUrl = `${environment.apiUrl}/EvaluarResultados`;

  constructor(private http: HttpClient) {}

  obtenerPorCaso(idCaso: number): Observable<EvaluarResultadosResponse> {
    return this.http.get<EvaluarResultadosResponse>(`${this.apiUrl}/${idCaso}`);
  }

  guardarPaso4(datos: EvaluarResultadosCreateDto): Observable<EvaluarResultadosResponse> {
    return this.http.post<EvaluarResultadosResponse>(this.apiUrl, datos);
  }

  completarPaso4(idPaso4: number): Observable<{ message: string; id_paso_actual: number }> {
    return this.http.put<{ message: string; id_paso_actual: number }>(`${this.apiUrl}/${idPaso4}/completar`, {});
  }

  cerrarPaso4(idPaso4: number, dto: EvaluarResultadosCierreDto): Observable<{ message: string; id_paso_actual?: number }> {
    return this.http.put<{ message: string; id_paso_actual?: number }>(`${this.apiUrl}/${idPaso4}/cerrar`, dto);
  }
}
