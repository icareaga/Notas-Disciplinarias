/**
 * CATEGORIA - Modelo que representa un tipo de incumplimiento disciplinario
 * 
 * Propiedades:
 * - id_Categoria: Identificador único de la categoría en la base de datos
 * - nombre: Nombre descriptivo (ej: "Retardo", "Agresión Física", etc)
 * - descripcion: Descripción detallada del tipo de incumplimiento
 * 
 * Ejemplo:
 * {
 *   id_Categoria: 1,
 *   nombre: "Retardo",
 *   descripcion: "Llegadas tardías al trabajo"
 * }
 */
export interface Categoria {
  id_Categoria: number;
  nombre: string;
  descripcion: string;
}
