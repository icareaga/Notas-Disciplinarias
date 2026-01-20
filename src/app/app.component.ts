import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header class="header">
      <div class="logo">📘 Notas Disciplinarias</div>
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
    
    // Escuchar cambios de navegación
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkTokenInUrl();
    });
  }

  private checkTokenInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('acces_token') || urlParams.get('access_token') || urlParams.get('token');
    
    if (token && !this.authService.getToken()) {
      console.log('🔑 TOKEN CAPTURADO desde URL:', token.substring(0, 20) + '...');
      console.log('📍 Ruta actual:', window.location.pathname);
      
      // Guardar token
      localStorage.setItem('token', token);
      
      // Decodificar y guardar usuario
      const tokenInfo = this.authService.getTokenInfo();
      if (tokenInfo) {
        localStorage.setItem('usuario', JSON.stringify(tokenInfo));
        console.log('✅ Usuario guardado:', tokenInfo);
        
        // Redirigir a login para mostrar bienvenida
        this.router.navigate(['/login'], { queryParams: {} });
      }
    }
  }
}
