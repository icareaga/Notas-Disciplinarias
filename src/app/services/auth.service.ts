import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../environments/environment';

/**
 * Interface que define la estructura normalizada de datos del usuario extraídos del JWT
 * Mapea diferentes nombres de propiedades que pueden venir del token (p.ej. Id/UserId, Nombre/Nombre_Completo)
 */
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
    exp?: number;  // Timestamp de expiración del token
    iat?: number;  // Timestamp de emisión del token
    [key: string]: unknown;
}

/**
 * AUTHSERVICE - Gestión centralizada de autenticación y sesión
 * 
 * Responsabilidades:
 * 1. Decodificar JWT usando jwt-decode para extraer datos del usuario
 * 2. Guardar/recuperar token y datos de usuario en localStorage
 * 3. Validar expiración del token
 * 4. Proveer datos normalizados del usuario a los componentes
 * 5. Manejar logout y limpieza de sesión
 * 
 * Flujo de autenticación:
 * - AppComponent captura el token desde la URL (enviado por ItGov)
 * - Se guarda en localStorage: token y usuario decodificado
 * - AuthService.getTokenInfo() decodifica y normaliza campos del JWT
 * - LoginComponent muestra los datos al usuario
 * - Otros componentes acceden a datos del usuario via este servicio
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = environment.apiUrl;

    constructor(private http: HttpClient) {}

    /**
     * Login tradicional (usado si no llega token desde ItGov)
     * Petición POST a /api/login con credenciales
     */
    login(payload: { userId: number; password: string}) {
        return this.http.post<any>(`${this.api}/login`, payload);
    }

    /**
     * Guarda sesión en localStorage
     * Intenta múltiples nombres de propiedades por si viene de diferentes fuentes
     */
    saveSession(response: any) {
        const token = response.token || response.link || response.acces_token;
        if (token) localStorage.setItem('token', token);
        if (response?.data) localStorage.setItem('usuario', JSON.stringify(response.data));
    }

    /**
     * Recupera el token JWT desde localStorage
     */
    getToken() {
        return localStorage.getItem('token');
    }

    /**
     * Decodifica el JWT y normaliza propiedades
     * Mapea variaciones de nombres (Id/UserId, Nombre/Nombre_Completo, etc)
     * para que los componentes siempre usen el mismo nombre
     */
    getTokenInfo(): UsuarioInfo | null {
        const token = this.getToken();
        if (!token) return null;
        try {
            const decoded = jwtDecode<UsuarioInfo>(token);
            // Normalizar propiedades del token para el componente
            // Usa la primera opción disponible si hay múltiples nombres posibles
            return {
                Id: decoded.UserId || decoded.Id,
                Nombre_Completo: decoded.Nombre_Completo || decoded.Nombre,
                Correo: decoded.Correo || decoded.Email,
                Rol: decoded.Rol || decoded.Role,
                ...decoded  // Incluir todas las demás propiedades del token
            };
        } catch (err) {
            console.error('Token inválido', err);
            return null;
        }
    }

    /**
     * Valida si el token ha expirado
     * Compara el timestamp 'exp' del token con la hora actual
     */
    isTokenExpired(): boolean {
        const info = this.getTokenInfo();
        if (!info?.exp) return false;
        const nowInSeconds = Math.floor(Date.now() / 1000);
        return info.exp <= nowInSeconds;
    }

    /**
     * Recupera datos del usuario desde localStorage (ya parseados)
     * Alternativa a getTokenInfo() si los datos se guardaron previamente
     */
    getUsuario() {
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u) : null;
    }

    /**
     * Limpia la sesión - borra todo de localStorage
     * Usado al hacer logout
     */
    logout() {
        localStorage.clear();
    }
}