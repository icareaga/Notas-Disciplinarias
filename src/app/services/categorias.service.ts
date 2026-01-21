import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';
import { environment } from '../../environments/environment';

/**
 * CATEGORIASSERVICE - Gestión del catálogo de categorías
 * 
 * Responsabilidades:
 * - Obtener todas las categorías de incumplimiento disponibles
 * 
 * Uso:
 * - SenalarProblemaComponent obtiene la lista de categorías para el dropdown
 * - Ejemplos: "Retardo", "Agresión Física", "Falta Injustificada", etc.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private apiUrl = `${environment.apiUrl}/Categorias`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el catálogo completo de categorías
   * @returns Observable con array de categorías
   * 
   * Estructura esperada:
   * [
   *   { id: 1, nombre: "Retardo", descripcion: "Llegadas tardías" },
   *   { id: 2, nombre: "Agresión Física", descripcion: "... }
   * ]
   */
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
}
