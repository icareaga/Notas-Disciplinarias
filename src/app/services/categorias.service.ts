import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../models/categoria.model';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private apiUrl = 'http://localhost:5269/api/Categorias';

  constructor(private http: HttpClient) {}

  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
}
