import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class UsuariosService {

  private apiUrl = `${environment.apiUrl}/Usuarios`;

  constructor(private http: HttpClient) {}

  obtenerJerarquia(plazaRaiz: string) {
    return this.http.get<any[]>(`${this.apiUrl}/jerarquia/${plazaRaiz}`);
  }
}
