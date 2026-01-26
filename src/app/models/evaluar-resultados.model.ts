export interface EvaluarResultadosResponse {
  id_paso4: number;
  id_caso: number;

  sesion_privada: string;
  comparacion: string;
  avances?: string | null;
  compromisos?: string | null;

  fecha_registro?: string;
  fecha_modificacion?: string | null;
  estatus?: number;

  // Opcional (si decides soportar cierre desde este paso)
  justificacion_cierre?: string | null;
  fecha_cierre?: string | null;
}

export interface EvaluarResultadosCreateDto {
  id_caso: number;
  sesion_privada: string;
  comparacion: string;
  avances?: string | null;
  compromisos?: string | null;
  id_usuario_registro?: number | null;
}

export interface EvaluarResultadosCierreDto {
  justificacion_cierre: string;
  id_usuario_cierre?: number | null;
}
