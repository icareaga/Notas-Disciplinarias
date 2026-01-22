/**
 * CASOCREATE - DTO para crear una nueva nota disciplinaria
 * 
 * Se envía al backend en POST /api/Casos/crear con propiedades en PascalCase
 * Backend espera: IdUsuario, IdCategoria, Descripcion, Impacto, Conducta, IdUsuarioJefe, IdPaso
 */
export interface CasoCreate {
  idUsuario: number;        // ID del empleado afectado
  idCategoria: number;
  descripcion: string;
  impacto: string;
  conducta: string;
  idUsuarioJefe?: number;   // ID del jefe que crea el caso (se llena automáticamente)
  estatus?: number;         // 1 = Activo (por defecto), 0 = Cerrado
  idPaso?: number;          // ID del paso actual (por defecto 1)
}
