/**
 * Modelo para el Paso 2: Determinar la Causa
 * Mapea la estructura de la tabla DeterminarCausa en la base de datos
 */
export interface DeterminarCausa {
  id_paso2?: number;
  id_caso: number;
  causas_identificadas: string;
  comentarios_adicionales?: string;
  fecha_registro?: Date;
  fecha_modificacion?: Date;
  id_usuario_registro?: number;
  estatus?: number; // 1=Activo, 0=Inactivo
}

/**
 * Modelo para las evidencias del Paso 2
 * Mapea la estructura de la tabla DeterminarCausa_Evidencias
 */
export interface DeterminarCausaEvidencia {
  id_evidencia?: number;
  id_paso2: number;
  id_caso: number;
  nombre_archivo: string;      // UUID o nombre generado
  nombre_original: string;      // Nombre original del archivo
  extension: string;            // .jpg, .png, .pdf
  tipo_mime: string;            // image/jpeg, application/pdf
  tamano_bytes: number;
  ruta_archivo: string;         // uploads/casos/{id}/paso2/archivo.ext
  descripcion?: string;
  fecha_carga?: Date;
  id_usuario_carga?: number;
}

/**
 * DTO para crear/actualizar Determinar Causa (coincide con backend C#)
 * Las propiedades van en snake_case para coincidir con el modelo C#
 */
export interface DeterminarCausaCreateDto {
  id_caso: number;
  causas_identificadas: string;
  comentarios_adicionales?: string;
  id_usuario_registro?: number;
}

/**
 * DTO de cierre del proceso desde el Paso 2.
 *
 * Nota: el endpoint esperado suele marcar el paso como cerrado/inactivo y,
 * dependiendo del backend, también puede marcar el caso como `estatus = 0`.
 */
export interface DeterminarCausaCierreDto {
  justificacion_cierre: string;
  id_usuario_cierre?: number | null;
}

/**
 * Respuesta del backend al guardar Paso 2
 */
export interface DeterminarCausaResponse {
  id_paso2: number;
  id_caso: number;
  causas_identificadas: string;
  comentarios_adicionales?: string;
  fecha_registro: string;
  fecha_modificacion?: string;
  id_usuario_registro?: number;
  estatus: number;
  Evidencias?: EvidenciaResponse[]; // Lista de evidencias (viene del Include en el backend)
}

/**
 * Respuesta al subir una evidencia
 */
export interface EvidenciaResponse {
  id_evidencia: number;
  id_paso2: number;
  id_caso: number;
  nombre_archivo: string;
  nombre_original: string;
  extension: string;
  tipo_mime: string;
  tamano_bytes: number;
  ruta_archivo: string;
  descripcion?: string;
  fecha_carga: string;
  id_usuario_carga?: number;
}


