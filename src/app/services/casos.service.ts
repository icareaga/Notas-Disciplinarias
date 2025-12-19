import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CasoCreate } from '../models/caso-create.model';

@Injectable({
  providedIn: 'root'
})
export class CasosService {

  private apiUrl = 'http://localhost:5269/api';

  constructor(private http: HttpClient) {}

  crearCaso(caso: CasoCreate): Observable<any> {
    return this.http.post(`${this.apiUrl}/Casos/crear`, caso);
  }

  obtenerCasos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/casos-activos/368048`);
  }
}
