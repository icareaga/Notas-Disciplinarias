/**
 * CASOCREATE - DTO para crear una nueva nota disciplinaria
 * 
 * Se envía al backend en POST /api/Casos/crear con propiedades en PascalCase
 * Backend espera: IdUsuario, IdCategoria, Descripcion, Impacto, Conducta
 */
export interface CasoCreate {
  idUsuario: number;
  idCategoria: number;
  descripcion: string;
  impacto: string;
  conducta: string;
}
