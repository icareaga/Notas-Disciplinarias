import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

/**
 * APPCOMPONENT - Componente raíz de la aplicación
 * 
 * RESPONSABILIDADES CLAVE:
 * 1. Capturar el token JWT enviado por ItGov en la URL como query parameter
 * 2. Decodificar el token y guardar datos del usuario en localStorage
 * 3. Renderizar header, footer y router-outlet para las demás vistas
 * 
 * FLUJO DE AUTENTICACIÓN (desde ItGov):
 * 1. Usuario hace click en ItGov para acceder a "Notas Disciplinarias"
 * 2. ItGov redirige a: http://localhost:4200/senalar-problema?acces_token=JWT_TOKEN_AQUI
 * 3. AppComponent.ngOnInit() detecta el token en la URL
 * 4. Decodifica el token usando AuthService.getTokenInfo()
 * 5. Guarda token y datos en localStorage
 * 6. Redirige a /login para mostrar bienvenida
 * 7. Limpia la URL quitando el query parameter por seguridad
 * 
 * ESTRUCTURA:
 * - Header: Logo y título (visible en todas las páginas)
 * - Main: router-outlet (aquí va el contenido dinámico: login, senalar-problema, etc)
 * - Footer: Copyright (visible en todas las páginas)
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header class="header">
      <div class="header-content">
        <img src="assets/logo_megacable.png" alt="Megacable" class="logo" />
        <h1 class="titulo">Notas Disciplinarias</h1>
      </div>
      <button class="btn-logout" (click)="cerrarSesion()" title="Cerrar sesión">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Cerrar Sesión</span>
      </button>
    </header>

    <main class="content">
      <router-outlet></router-outlet>
    </main>

    <footer class="footer">
      <p>© 2025 Megacable - Sistema de Notas Disciplinarias</p>
    </footer>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('🌐 AppComponent iniciado - Escuchando redirecciones de ItGov...');
    
    // Capturar token entregado por ItGov si llegó en el query string
    this.checkTokenInUrl();
    
    // Escuchar cambios de navegación por si el token llega después
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkTokenInUrl();
    });
  }

  /**
   * Verifica si hay un token en la URL (enviado por ItGov)
   * Si existe y no está guardado, lo guarda y redirige a login
   * 
   * Intenta múltiples nombres de query parameter:
   * - acces_token (nombre de ItGov)
   * - access_token (estándar)
   * - token (fallback)
   */
  private checkTokenInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('acces_token') || urlParams.get('access_token') || urlParams.get('token');
    
    if (token && !this.authService.getToken()) {
      console.log('🔑 TOKEN CAPTURADO desde URL:', token.substring(0, 20) + '...');
      console.log('📍 Ruta actual:', window.location.pathname);
      
      // Guardar token en localStorage
      localStorage.setItem('token', token);
      
      // Decodificar y guardar info del usuario desde el JWT
      const tokenInfo = this.authService.getTokenInfo();
      if (tokenInfo) {
        localStorage.setItem('usuario', JSON.stringify(tokenInfo));
        console.log('✅ Usuario guardado:', tokenInfo);
        
        // Redirigir a login para mostrar pantalla de bienvenida
        this.router.navigate(['/login'], { queryParams: {} });
      }
    }
  }

  cerrarSesion(): void {
    // Limpiar localStorage/sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirigir a MIRH ITGOV
    window.location.href = 'https://mirh.megacorp.com.mx:84/ITGovApp/Login/Index';
  }
}
