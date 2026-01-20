import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CasoCreate } from '../models/caso-create.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CasosService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  crearCaso(caso: CasoCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/Casos/crear`, caso);
  }

  obtenerCasos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/casos-activos`);
  }

  obtenerCasosPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Casos/usuario/${idUsuario}`);
  }

  descargarPDF(id: number) {
    return this.http.get(`${this.apiUrl}/casos/${id}/pdf`, { responseType: 'blob' });
  }

}
