import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation-buttons',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="nav-buttons">
      <button class="btn-back" (click)="goBack()" title="Regresar al inicio">
        <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024">
          <path fill="#ffffff" stroke="#ffffff" stroke-width="20" d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
        </svg>
        <span>Regresar</span>
      </button>
    </div>
  `,
  styles: [`
    .nav-buttons {
      display: flex;
      gap: 12px;
      margin-bottom: 20px;
    }

    button {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      letter-spacing: 0.5px;
    }

    .btn-back {
      background-color: rgb(0, 71, 187);
    }

    .btn-back:hover {
      box-shadow: 9px 9px 33px #d1d1d1, -9px -9px 33px #d1d1d1;
      transform: translateY(-2px);
    }

    svg {
      width: 16px;
      height: 16px;
    }

    span {
      color: #ffffff;
    }
  `]
})
export class NavigationButtonsComponent {
  constructor(private router: Router) {}

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
