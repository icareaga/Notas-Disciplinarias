import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { 
  DeterminarCausa, 
  DeterminarCausaCreateDto, 
  DeterminarCausaResponse,
  DeterminarCausaEvidencia,
  EvidenciaResponse,
  DeterminarCausaCierreDto
} from '../models/determinar-causa.model';
import { environment } from '../../environments/environment';

/**
 * Servicio para gestionar el Paso 2: Determinar la Causa
 * Maneja las operaciones CRUD y el upload de evidencias
 */
@Injectable({
  providedIn: 'root'
})
export class DeterminarCausaService {
  private apiUrl = `${environment.apiUrl}/DeterminarCausa`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene los datos del Paso 2 para un caso específico
   * GET /api/DeterminarCausa/{idCaso}
   * @param idCaso - ID del caso
   * @returns Observable con los datos de DeterminarCausa incluyendo evidencias
   */
  obtenerPorCaso(idCaso: number): Observable<DeterminarCausaResponse> {
    return this.http.get<DeterminarCausaResponse>(`${this.apiUrl}/${idCaso}`);
  }

  /**
   * Guarda o actualiza los datos del Paso 2 (sin evidencias)
   * POST /api/DeterminarCausa
   * Si el caso ya tiene un registro, lo actualiza; si no, crea uno nuevo
   * @param datos - Datos del formulario
   * @returns Observable con la respuesta del servidor
   */
  guardarPaso2(datos: DeterminarCausaCreateDto): Observable<DeterminarCausaResponse> {
    return this.http.post<DeterminarCausaResponse>(this.apiUrl, datos);
  }

  /**
   * Sube una evidencia para el Paso 2
   * POST /api/DeterminarCausa/{idPaso2}/evidencias
   * @param idPaso2 - ID del paso 2
   * @param archivo - Archivo a subir
   * @param descripcion - Descripción opcional
   * @param idUsuario - ID del usuario que sube el archivo
   * @returns Observable con la respuesta
   */
  subirEvidencia(
    idPaso2: number, 
    archivo: File, 
    descripcion: string = '', 
    idUsuario: number = 0
  ): Observable<EvidenciaResponse> {
    const formData = new FormData();
    // El backend C# espera estos nombres exactos
    formData.append('archivo', archivo, archivo.name);
    formData.append('descripcion', descripcion);
    formData.append('idUsuario', idUsuario.toString());

    console.log('📤 Subiendo evidencia:', {
      idPaso2,
      archivo: archivo.name,
      tamano: archivo.size,
      tipo: archivo.type,
      descripcion,
      idUsuario
    });

    return this.http.post<EvidenciaResponse>(
      `${this.apiUrl}/${idPaso2}/evidencias`, 
      formData
    );
  }

  /**
   * Guarda el Paso 2 completo: datos + evidencias
   * Primero crea/actualiza el paso2, luego sube las evidencias una por una
   * @param datos - Datos del paso 2
   * @param archivos - Archivos a subir
   * @param idUsuario - ID del usuario
   * @returns Observable con resultado completo
   */
  guardarCompleto(
    datos: DeterminarCausaCreateDto, 
    archivos: File[], 
    idUsuario: number = 0
  ): Observable<{ paso2: DeterminarCausaResponse; evidencias: EvidenciaResponse[] }> {
    return this.guardarPaso2(datos).pipe(
      switchMap(paso2 => {
        if (archivos.length === 0) {
          return of({ paso2, evidencias: [] });
        }

        const uploads = archivos.map(archivo => 
          this.subirEvidencia(paso2.id_paso2, archivo, '', idUsuario)
        );

        return forkJoin(uploads).pipe(
          map(evidencias => ({ paso2, evidencias }))
        );
      })
    );
  }

  /**
   * Elimina una evidencia específica
   * DELETE /api/Evidencias/{id}
   * @param idEvidencia - ID de la evidencia a eliminar
   * @returns Observable con la respuesta
   */
  eliminarEvidencia(idEvidencia: number): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/api/Evidencias/${idEvidencia}`);
  }

  /**
   * Marca el Paso 2 como completado (estatus = 0) y avanza al Paso 3
   * PUT /api/DeterminarCausa/{idPaso2}/completar
   * @param idPaso2 - ID del paso 2 a completar
   * @returns Observable con la respuesta
   */
  completarPaso2(idPaso2: number): Observable<{ message: string; id_paso_actual: number }> {
    return this.http.put<{ message: string; id_paso_actual: number }>(
      `${this.apiUrl}/${idPaso2}/completar`,
      {}
    );
  }

  /**
   * Cierra el proceso desde el Paso 2 (si el backend lo soporta).
   * PUT /api/DeterminarCausa/{idPaso2}/cerrar
   */
  cerrarPaso2(
    idPaso2: number,
    dto: DeterminarCausaCierreDto
  ): Observable<{ message: string; id_paso_actual?: number }> {
    return this.http.put<{ message: string; id_paso_actual?: number }>(`${this.apiUrl}/${idPaso2}/cerrar`, dto);
  }

  /**
   * Valida que un archivo cumpla con las restricciones
   * @param file - Archivo a validar
   * @returns Objeto con el resultado de la validación
   */
  validarArchivo(file: File): { valido: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      return { valido: false, error: 'El archivo excede el tamaño máximo de 10MB' };
    }

    if (!tiposPermitidos.includes(file.type)) {
      return { valido: false, error: 'Solo se permiten archivos JPG, PNG o PDF' };
    }

    return { valido: true };
  }
}
