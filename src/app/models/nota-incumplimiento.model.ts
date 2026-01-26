export interface NotaIncumplimientoResponse {
  id_paso5: number;
  id_caso: number;

  comportamiento: string;
  observaciones: string;

  id_usuario_registro?: number | null;
  fecha_registro?: string;
  fecha_modificacion?: string | null;
  estatus?: number;

  // opcional si se implementa cierre desde este paso
  justificacion_cierre?: string | null;
  fecha_cierre?: string | null;
}

export interface NotaIncumplimientoCreateDto {
  id_caso: number;
  comportamiento: string;
  observaciones: string;
  id_usuario_registro?: number | null;
}

export interface NotaIncumplimientoCierreDto {
  justificacion_cierre: string;
  id_usuario_cierre?: number | null;
}
