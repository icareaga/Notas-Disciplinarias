import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

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
export class AppComponent {}
