import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authService.getToken();
    
    // Si hay token y está en /login, redirige a /usuario
    if (token && state.url === '/login') {
      this.router.navigate(['/usuario']);
      return false;
    }
    
    // Si no hay token en rutas protegidas, redirige a login
    if (!token && state.url !== '/login') {
      this.router.navigate(['/login']);
      return false;
    }
    
    return true;
  }
}
