import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service';
import { CasosService } from '../../../services/casos.service';
import { ActaAdministrativaService } from '../../../services/acta-administrativa.service';
import { ActaAdministrativaCreateDto } from '../../../models/acta-administrativa.model';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';
import { NotificationsService } from '../../../shared/notifications/notifications.service';

@Component({
  selector: 'app-acta-administrativa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigationButtonsComponent],
  templateUrl: './acta-administrativa.component.html',
  styleUrls: ['./acta-administrativa.component.scss']
})
export class ActaAdministrativaComponent {
  actaForm: FormGroup;
  cierreForm: FormGroup;
  mostrarTerminarProceso = false;

  idCaso = 0;
  idPaso6Existente = 0;
  isLoading = false;
  errorMensaje = '';
  modoEdicion = false;
  casoActual: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private actaAdministrativaService: ActaAdministrativaService,
    private casosService: CasosService,
    private authService: AuthService,
    private notifications: NotificationsService
  ) {
    this.actaForm = this.fb.group({
      colaborador: ['', Validators.required],
      historial: ['', Validators.required],
      evidencias: [''],
      version_colaborador: [''],
      firmas: ['']
    });

    this.cierreForm = this.fb.group({
      justificacion: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.idCaso = +params['idCaso'] || 0;
      if (this.idCaso > 0) {
        this.cargarCaso();
        this.cargarDatosPaso6();
      }
    });
  }

  cargarCaso(): void {
    this.casosService.obtenerCasoPorId(this.idCaso).subscribe({
      next: (caso) => {
        this.casoActual = caso;
      },
      error: () => {
        this.errorMensaje = 'No se pudo cargar el caso';
      }
    });
  }

  cargarDatosPaso6(): void {
    this.actaAdministrativaService.obtenerPorCaso(this.idCaso).subscribe({
      next: (data) => {
        this.modoEdicion = true;
        this.idPaso6Existente = data.id_paso6;
        this.actaForm.patchValue({
          colaborador: data.colaborador,
          historial: data.historial,
          evidencias: data.evidencias ?? '',
          version_colaborador: data.version_colaborador ?? '',
          firmas: data.firmas ?? ''
        });
      },
      error: () => {
        this.modoEdicion = false;
      }
    });
  }

  onSubmit() {
    if (this.actaForm.invalid) {
      this.errorMensaje = 'Por favor complete todos los campos requeridos';
      this.actaForm.markAllAsTouched();
      return;
    }

    if (this.idCaso === 0) {
      this.errorMensaje = 'Error: No se encontró el ID del caso';
      return;
    }

    this.isLoading = true;
    this.errorMensaje = '';

    const eraEdicion = this.modoEdicion;
    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;

    const payload: ActaAdministrativaCreateDto = {
      id_caso: this.idCaso,
      colaborador: this.actaForm.value.colaborador,
      historial: this.actaForm.value.historial,
      evidencias: this.actaForm.value.evidencias || null,
      version_colaborador: this.actaForm.value.version_colaborador || null,
      firmas: this.actaForm.value.firmas || null,
      id_usuario_registro: idUsuario
    };

    this.actaAdministrativaService.guardarPaso6(payload).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.idPaso6Existente = resp.id_paso6;
        this.modoEdicion = true;
        this.notifications.success(`✅ Paso 6 ${eraEdicion ? 'actualizado' : 'guardado'} correctamente`);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMensaje =
          (typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? 'Error al guardar el acta administrativa'));
      }
    });
  }

  finalizarProceso() {
    if (!this.idPaso6Existente || this.idPaso6Existente === 0) {
      this.errorMensaje = 'Debe guardar el Paso 6 antes de finalizar';
      return;
    }

    if (!confirm('¿Desea completar el Paso 6? Al completarlo, el caso se cerrará automáticamente.')) {
      return;
    }

    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;

    this.isLoading = true;
    this.errorMensaje = '';

    // Por requerimiento: en el último paso solo hay “Completar”, y al completar se cierra el caso.
    // Usamos el endpoint /cerrar para garantizar cambio de estatus en BD.
    this.actaAdministrativaService
      .cerrarPaso6(this.idPaso6Existente, {
        justificacion_cierre: 'Cierre automático al completar el Paso 6 (Acta Administrativa).',
        id_usuario_cierre: idUsuario
      })
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            return of({ message: 'El backend no expone /cerrar en Paso 6. Se cerrará el caso directamente.' } as any);
          }
          throw err;
        }),
        switchMap((resp) =>
          this.casosService
            .cerrarCaso(this.idCaso, {
              justificacion_cierre: 'Cierre automático al completar el Paso 6 (Acta Administrativa).',
              id_usuario_cierre: idUsuario
            })
            .pipe(map(() => resp))
        )
      )
      .subscribe({
        next: (resp) => {
          this.isLoading = false;
          this.notifications.success('✅ Caso cerrado correctamente');
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.isLoading = false;
          const backendBody = err?.error;
          this.errorMensaje =
            (typeof backendBody === 'string'
              ? backendBody
              : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
            'No se pudo cerrar el caso';
        }
      });
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    if (this.cierreForm.invalid) {
      this.errorMensaje = 'Debe escribir la justificación de cierre';
      this.cierreForm.markAllAsTouched();
      return;
    }

    if (!this.idPaso6Existente || this.idPaso6Existente === 0) {
      this.errorMensaje = 'Guarde primero el Paso 6 antes de cerrar el proceso';
      return;
    }

    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;

    const justificacion = String(this.cierreForm.value.justificacion ?? '').trim();

    this.isLoading = true;
    this.errorMensaje = '';

    this.actaAdministrativaService
      .cerrarPaso6(this.idPaso6Existente, {
        justificacion_cierre: justificacion,
        id_usuario_cierre: idUsuario
      })
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            return of({ message: 'El backend no expone /cerrar en Paso 6. Se cerrará el caso directamente.' } as any);
          }
          throw err;
        }),
        switchMap((resp) =>
          this.casosService
            .cerrarCaso(this.idCaso, { justificacion_cierre: justificacion, id_usuario_cierre: idUsuario })
            .pipe(map(() => resp))
        )
      )
      .subscribe({
        next: (resp) => {
          this.isLoading = false;
          this.notifications.success('✅ Caso cerrado correctamente');
          this.router.navigate(['/admin']);
        },
        error: (err) => {
          this.isLoading = false;
          const backendBody = err?.error;
          this.errorMensaje =
            (typeof backendBody === 'string'
              ? backendBody
              : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
            'No se pudo cerrar el caso';
        }
      });
  }
}
