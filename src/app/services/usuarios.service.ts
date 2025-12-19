import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private apiUrl = 'http://localhost:5269/api/Usuarios';

  constructor(private http: HttpClient) {}

  obtenerJerarquia(plazaRaiz: string) {
    return this.http.get<any[]>(`${this.apiUrl}/jerarquia/${plazaRaiz}`);
  }
}
