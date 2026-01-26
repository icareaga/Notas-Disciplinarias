/**
 * Modelos para Paso 3: Plan de Acción
 *
 * Convención:
 * - El backend expone snake_case (como Paso 2)
 * - El frontend usa estos tipos para tipar respuestas/payloads
 */

export interface PlanAccionResponse {
  id_paso3: number;
  id_caso: number;
  metas_claras: string;
  herramientas_necesarias?: string | null;
  capacitacion_sesion: string;
  documentacion_capacitacion?: string | null;
  fecha_registro?: string;
  fecha_modificacion?: string;
  estatus?: number; // 1 = Activo/en progreso, 0 = Completado
}

export interface PlanAccionCreateDto {
  id_caso: number;
  metas_claras: string;
  herramientas_necesarias?: string | null;
  capacitacion_sesion: string;
  documentacion_capacitacion?: string | null;
  id_usuario_registro?: number;
}

/**
 * DTO de cierre del proceso desde el Paso 3.
 *
 * Nota: el backend debe soportar el endpoint `/cerrar` para que el cierre
 * impacte en BD (y, si aplica, cierre también el caso).
 */
export interface PlanAccionCierreDto {
  justificacion_cierre: string;
  id_usuario_cierre?: number | null;
}
