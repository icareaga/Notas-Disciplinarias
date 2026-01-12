import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
@Component({
 selector: 'app-login',
 standalone: true,
 imports: [CommonModule, FormsModule],
 templateUrl: './login.component.html',
 styleUrls: ['./login.component.scss']
})
export class LoginComponent {
 username: number | null = null; // 👈 ID de usuario (según tu API)
 password: string = '';
 errorMessage: string = '';
 constructor(
   private authService: AuthService,
   private router: Router
 ) {}
 login() {
   if (!this.username || !this.password) {
     this.errorMessage = 'Usuario y contraseña requeridos';
     return;
   }
   this.authService.login({
     userId: this.username,
     password: this.password
   }).subscribe({
     next: (res) => {
       this.authService.saveSession(res);
       this.router.navigate(['/dashboard']); // o la ruta que quieras
     },
     error: (err) => {
       console.error(err);
       this.errorMessage = 'Credenciales incorrectas';
     }
   });
 }
}