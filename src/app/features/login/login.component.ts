import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], //  Importante
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  login() {
    const users = [
      { username: 'admin', password: '1234', role: 'admin' },
      { username: 'usuario', password: '1234', role: 'user' }
    ];

    const user = users.find(
      u => u.username === this.username && u.password === this.password
    );

    if (user) {
      alert(`Bienvenido ${user.role.toUpperCase()}!`);
      // aquí podrías usar router.navigate(['/senalar-problema']);
    } else {
      this.errorMessage = 'Usuario o contraseña incorrectos';
    }
  }
}
