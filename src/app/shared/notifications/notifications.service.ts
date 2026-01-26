import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  title?: string;
  timeoutMs?: number;
}

export interface NotificationToast {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  timeoutMs: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private readonly toastsSubject = new BehaviorSubject<NotificationToast[]>([]);
  readonly toasts$ = this.toastsSubject.asObservable();

  show(type: NotificationType, message: string, timeoutMsOrOptions: number | NotificationOptions = 3500): void {
    const opts: NotificationOptions =
      typeof timeoutMsOrOptions === 'number' ? { timeoutMs: timeoutMsOrOptions } : timeoutMsOrOptions;
    const timeoutMs = opts.timeoutMs ?? 3500;

    const toast: NotificationToast = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      type,
      title: opts.title,
      message,
      timeoutMs
    };

    const next = [...this.toastsSubject.value, toast];
    this.toastsSubject.next(next);

    window.setTimeout(() => this.dismiss(toast.id), timeoutMs);
  }

  success(message: string, timeoutMsOrOptions: number | NotificationOptions = 3000): void {
    this.show('success', message, timeoutMsOrOptions);
  }

  error(message: string, timeoutMsOrOptions: number | NotificationOptions = 6000): void {
    this.show('error', message, timeoutMsOrOptions);
  }

  info(message: string, timeoutMsOrOptions: number | NotificationOptions = 3500): void {
    this.show('info', message, timeoutMsOrOptions);
  }

  warning(message: string, timeoutMsOrOptions: number | NotificationOptions = 4500): void {
    this.show('warning', message, timeoutMsOrOptions);
  }

  dismiss(id: string): void {
    const filtered = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(filtered);
  }

  clear(): void {
    this.toastsSubject.next([]);
  }
}
