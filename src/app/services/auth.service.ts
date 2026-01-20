import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

interface UsuarioInfo {
    Id?: number | string;
    UserId?: number | string;
    Nombre?: string;
    Nombre_Completo?: string;
    Correo?: string;
    Email?: string;
    Rol?: string;
    Role?: string;
    Area?: string;
    Departamento?: string;
    Plaza?: string;
    PlazaJefe?: string;
    exp?: number;
    iat?: number;
    [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = environment.apiUrl;

    constructor(private http: HttpClient) {}

    login(payload: { userId: number; password: string}) {
        return this.http.post<any>(`${this.api}/login`, payload);
    }

    saveSession(response: any) {
        const token = response.token || response.link || response.acces_token;
        if (token) localStorage.setItem('token', token);
        if (response?.data) localStorage.setItem('usuario', JSON.stringify(response.data));
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getTokenInfo(): UsuarioInfo | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded = jwtDecode<UsuarioInfo>(token);
            // Normalizar propiedades del token para el componente
            return {
                Id: decoded.UserId || decoded.Id,
                Nombre_Completo: decoded.Nombre_Completo || decoded.Nombre,
                Correo: decoded.Correo || decoded.Email,
                Rol: decoded.Rol || decoded.Role,
                ...decoded
            };
        } catch (err) {
            console.error('Token inválido', err);
            return null;
        }
    }

    isTokenExpired(): boolean {
        const info = this.getTokenInfo();
        if (!info?.exp) return false;
        const nowInSeconds = Math.floor(Date.now() / 1000);
        return info.exp <= nowInSeconds;
    }

    getUsuario() {
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u) : null;
    }

    logout() {
        localStorage.clear();
    }
}