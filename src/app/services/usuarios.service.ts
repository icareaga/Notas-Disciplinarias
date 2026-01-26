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
   * OBTENER EMPLEADOS SUBORDINADOS DE UN JEFE
   * 
   * Este método es crucial para el componente SenalarProblemaComponent.
   * Permite al jefe ver la lista de empleados a los que puede asignar notas.
   * 
   * FLUJO:
   * 1. Se llama al iniciar SenalarProblemaComponent
   * 2. Envía GET /api/Usuarios/jerarquia/{plazaRaiz}
   * 3. Backend consulta la base de datos (tabla UsuariosVista)
   * 4. Retorna array de empleados que reportan a este jefe
   * 5. Frontend popula el dropdown "Colaborador"
   * 
   * @param plazaRaiz - ID del jefe (se obtiene del token JWT en campo PlazaJefe o Id)
   * @returns Observable<any[]> con estructura:
   * {
   *   "resultados": [
   *     {
   *       "id": 123,                    // ID principal (puede variar formato)
   *       "id_usuario": 123,            // ID alternativo
   *       "id_emple_completo": 123,     // ID legacy
   *       "nombre_Completo": "Juan Pérez García",
   *       "correo": "juan@megacable.com.mx",
   *       "plaza": "114683",
   *       "departamento": "Ventas",
   *       "puesto": "Ejecutivo de Ventas"
   *     },
   *     // ... más empleados
   *   ]
   * }
   * 
   * NOTAS IMPORTANTES:
   * - El backend puede retornar múltiples formatos de ID (id, id_usuario, id_emple_completo)
   * - El frontend normaliza esto en SenalarProblemaComponent
   * - Si el jefe no tiene subordinados, retorna array vacío
   * - Requiere autenticación Bearer token
   * 
   * EJEMPLO DE USO:
   * ```typescript
   * const jefeId = '12345';
   * this.usuariosService.obtenerJerarquia(jefeId).subscribe({
   *   next: (data) => {
   *     this.empleados = data.resultados;
   *     console.log(`Jefe tiene ${this.empleados.length} subordinados`);
   *   },
   *   error: (err) => console.error('Error al cargar empleados', err)
   * });
   * ```
   */
  obtenerJerarquia(plazaRaiz: string) {
    return this.http.get<any[]>(`${this.apiUrl}/jerarquia/${plazaRaiz}`);
  }
}
