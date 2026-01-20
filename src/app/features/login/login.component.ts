import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface UsuarioData {
  Id?: number | string;
  UserId?: number | string;
  Rol?: string;
  Role?: string;
  Nombre?: string;
  Nombre_Completo?: string;
  Correo?: string;
  Email?: string;
  Area?: string;
  Departamento?: string;
  Plaza?: string;
  PlazaJefe?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  isLoggedIn: boolean = false;
  usuarioData: UsuarioData | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🚀 LoginComponent iniciado');
    console.log('📍 URL actual:', window.location.href);
    
    // Verificar localStorage al iniciar
    const tokenEnStorage = localStorage.getItem('token');
    const usuarioEnStorage = localStorage.getItem('usuario');
    console.log('💾 LocalStorage al iniciar:', {
      token: tokenEnStorage ? tokenEnStorage.substring(0, 20) + '...' : 'No hay',
      usuario: usuarioEnStorage ? JSON.parse(usuarioEnStorage) : 'No hay'
    });
    
    // 1. Primero verificar si viene token desde ItGov en la URL
    this.route.queryParams.subscribe(params => {
      console.log('🔍 Query params recibidos:', params);
      const token = params['acces_token'];
      
      if (token) {
        console.log('🔑 Token recibido desde ItGov:', token.substring(0, 20) + '...');
        
        // Guardar token
        localStorage.setItem('token', token);
        console.log('💾 Token guardado en localStorage');
        
        // Decodificar y guardar info del usuario
        const tokenInfo = this.authService.getTokenInfo();
        console.log('🔓 Token decodificado:', tokenInfo);
        
        if (tokenInfo) {
          localStorage.setItem('usuario', JSON.stringify(tokenInfo));
          console.log('👤 Usuario autenticado:', tokenInfo);
          this.usuarioData = tokenInfo as UsuarioData;
          this.isLoggedIn = true;
          
          console.log('✅ Estado ACTUALIZADO del componente:', {
            isLoggedIn: this.isLoggedIn,
            usuarioData: this.usuarioData,
            'usuarioData.Nombre_Completo': this.usuarioData.Nombre_Completo,
            'usuarioData.Id': this.usuarioData.Id,
            'usuarioData.Rol': this.usuarioData.Rol,
            'usuarioData.Correo': this.usuarioData.Correo
          });

          // Forzar detección de cambios
          this.cdr.detectChanges();
        } else {
          console.error('❌ No se pudo decodificar el token');
        }
        
        // Limpiar URL de query params
        this.router.navigate(['/login'], {
          queryParams: {},
          replaceUrl: true
        });
        
        return;
      } else {
        console.log('⚠️ No hay token en la URL');
        
        // 2. Si no viene token en URL, verificar si ya existe en localStorage
        const existingToken = this.authService.getToken();
        console.log('🔎 Buscando token existente:', existingToken ? 'Encontrado' : 'No encontrado');
        
        if (existingToken) {
          // Rehidratar estado de sesión con lo que esté guardado
          this.isLoggedIn = true;
          const usuarioStr = localStorage.getItem('usuario');
          console.log('📄 Usuario string en localStorage:', usuarioStr);
          
          if (usuarioStr) {
            try {
              this.usuarioData = JSON.parse(usuarioStr);
              console.log('✅ Usuario cargado desde localStorage:', this.usuarioData);
              console.log('📊 Propiedades:', {
                'Id': this.usuarioData?.Id,
                'Nombre_Completo': this.usuarioData?.Nombre_Completo,
                'Rol': this.usuarioData?.Rol,
                'Correo': this.usuarioData?.Correo
              });
            } catch (error) {
              console.error('❌ Error al parsear usuario:', error);
            }
          } else {
            console.warn('⚠️ Token existe pero no hay datos de usuario en localStorage');
          }

          // Forzar detección de cambios
          this.cdr.detectChanges();
        } else {
          console.log('ℹ️ No hay sesión activa. Esperando autenticación desde ItGov...');
        }
      }
      
      // Log final del estado
      console.log('🎯 Estado FINAL del componente:', {
        isLoggedIn: this.isLoggedIn,
        hasUsuarioData: !!this.usuarioData,
        usuarioData: this.usuarioData
      });
    });
  }

  continuar() {
    console.log('➡️ Navegando a señalar problema...');
    this.router.navigate(['/senalar-problema']);
  }

  verNotas() {
    console.log('👁️ Ver notas del usuario...');
    this.router.navigate(['/usuario']);
  }

  abrirNotas() {
    console.log('✍️ Abrir notas (Admin)...');
    this.router.navigate(['/nota-incumplimiento']);
  }

  isAdmin(): boolean {
    return this.usuarioData?.Rol?.toLowerCase() === 'admin';
  }

  isPlazaJefe(): boolean {
    return !!this.usuarioData?.PlazaJefe;
  }

  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.usuarioData = null;
    this.router.navigate(['/login']);
  }
}