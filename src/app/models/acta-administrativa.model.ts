export interface ActaAdministrativaResponse {
  id_paso6: number;
  id_caso: number;

  colaborador: string;
  historial: string;
  evidencias?: string | null;
  version_colaborador?: string | null;
  firmas?: string | null;

  id_usuario_registro?: number | null;
  fecha_registro?: string;
  fecha_modificacion?: string | null;
  estatus?: number;

  // opcional: cierre del caso desde paso 6
  justificacion_cierre?: string | null;
  fecha_cierre?: string | null;
  id_usuario_cierre?: number | null;
}

export interface ActaAdministrativaCreateDto {
  id_caso: number;

  colaborador: string;
  historial: string;
  evidencias?: string | null;
  version_colaborador?: string | null;
  firmas?: string | null;

  id_usuario_registro?: number | null;
}

export interface ActaAdministrativaCierreDto {
  justificacion_cierre: string;
  id_usuario_cierre?: number | null;
}
