import {Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private api = environment.apiUrl;

    constructor(private https: HttpClient) {}

    login(payload: { userId: number; password: string}) {
        return this.https.post<any>('${this.api}/login', payload);
    }

    saveSession(response: any) {
        const token = response.token || response.link || response.acces_token;
        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(response.data));
    }

    getToken() {
        return localStorage.getItem('token');
    }

    getUsuario() {
        const u = localStorage.getItem('usuario');
        return u ? JSON.parse(u) : null;
    }

    logout() {
        localStorage.clear();
    }
}