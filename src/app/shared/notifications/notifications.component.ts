import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService } from './notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-host" aria-live="polite" aria-atomic="true">
      <div
        class="toast"
        *ngFor="let t of (toasts$ | async)"
        [class.success]="t.type === 'success'"
        [class.error]="t.type === 'error'"
        [class.info]="t.type === 'info'"
        [class.warning]="t.type === 'warning'">
        <div class="left">
          <div class="icon" aria-hidden="true">
            <span *ngIf="t.type === 'success'">✓</span>
            <span *ngIf="t.type === 'error'">!</span>
            <span *ngIf="t.type === 'info'">i</span>
            <span *ngIf="t.type === 'warning'">!</span>
          </div>
          <div class="content">
            <div class="title" *ngIf="t.title">{{ t.title }}</div>
            <div class="message">{{ t.message }}</div>
          </div>
        </div>

        <button class="close" type="button" (click)="dismiss(t.id)" aria-label="Cerrar">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-host {
      position: fixed;
      top: 84px;
      right: 16px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: min(420px, calc(100vw - 32px));
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 12px;
      border-radius: 10px;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      border-left: 4px solid #0046ad;
      animation: toastIn 140ms ease-out;
    }

    @keyframes toastIn {
      from { transform: translateX(10px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .left {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      min-width: 0;
    }

    .content {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .title {
      font-weight: 800;
      color: #111;
      font-size: 13px;
      letter-spacing: 0.2px;
    }

    .icon {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      display: grid;
      place-items: center;
      font-weight: 800;
      font-size: 14px;
      flex: 0 0 auto;
      color: #fff;
      background: #0046ad;
    }

    .toast.success .icon { background: #2e7d32; }
    .toast.error .icon { background: #d32f2f; }
    .toast.info .icon { background: #0046ad; }
    .toast.warning .icon { background: #f57c00; }

    .toast.success { border-left-color: #2e7d32; }
    .toast.error { border-left-color: #d32f2f; }
    .toast.info { border-left-color: #0046ad; }
    .toast.warning { border-left-color: #f57c00; }

    .message {
      color: #222;
      font-size: 14px;
      line-height: 1.35;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: pre-line;
    }

    .close {
      border: none;
      background: transparent;
      color: #555;
      font-size: 18px;
      line-height: 18px;
      padding: 0 4px;
      cursor: pointer;
    }

    .close:hover {
      color: #000;
    }
  `]
})
export class NotificationsComponent {
  constructor(private notifications: NotificationsService) {}

  get toasts$() {
    return this.notifications.toasts$;
  }

  dismiss(id: string): void {
    this.notifications.dismiss(id);
  }
}
