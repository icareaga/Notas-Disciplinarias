import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

/**
 * USUARIOSSERVICE - Gestión de datos de usuarios y estructura organizacional
 * 
 * Responsabilidades:
 * - Obtener la jerarquía de subordinados de un usuario
 * - Consultar datos de empleados desde la vista UsuariosVista del backend
 * 
 * Flujo:
 * 1. Un jefe inicia sesión con su ID (viene en el token JWT)
 * 2. LoginComponent llama a obtenerJerarquia(idUsuario)
 * 3. Backend consulta UsuariosVista y devuelve { resultados: [...empleados...] }
 * 4. SenalarProblemaComponent recibe la lista para mostrar en dropdown
 * 5. El jefe selecciona un empleado para crear una nota disciplinaria
 */
@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/Usuarios`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los usuarios del sistema (empleados y jefes)
   * @returns Observable con array de usuarios
   */
  obtenerTodos() {
    return this.http.get<any[]>(`${this.apiUrl}/todos`);
  }

  /**
   * Obtiene los empleados subordinados de un usuario jefe
   * @param plazaRaiz - ID del usuario jefe
   * @returns Observable con { resultados: Array de empleados }
   * 
   * Ejemplo de respuesta:
   * {
   *   "resultados": [
   *     { "idUsuario": 123, "nombreCompleto": "Juan Pérez", "correo": "juan@example.com" },
   *     { "idUsuario": 124, "nombreCompleto": "María López", "correo": "maria@example.com" }
   *   ]
   * }
   */
  obtenerJerarquia(plazaRaiz: string) {
    return this.http.get<any[]>(`${this.apiUrl}/jerarquia/${plazaRaiz}`);
  }
}
