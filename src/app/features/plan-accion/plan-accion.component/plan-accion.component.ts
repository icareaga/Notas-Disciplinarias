import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { PlanAccionService } from '../../../services/plan-accion.service';
import { CasosService } from '../../../services/casos.service';
import { PlanAccionCreateDto } from '../../../models/plan-accion.model';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';
import { AuthService } from '../../../services/auth.service';
import { NotificationsService } from '../../../shared/notifications/notifications.service';

@Component({
  selector: 'app-plan-accion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavigationButtonsComponent],
  templateUrl: './plan-accion.component.html',
  styleUrls: ['./plan-accion.component.scss']
})
export class PlanAccionComponent {
  planForm: FormGroup;
  cierreForm: FormGroup;
  mostrarTerminarProceso = false;
  idCaso: number = 0;
  idPaso3Existente: number = 0;
  isLoading = false;
  errorMensaje: string = '';
  modoEdicion = false;
  casoActual: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private planAccionService: PlanAccionService,
    private casosService: CasosService,
    private authService: AuthService,
    private notifications: NotificationsService
  ) {
    this.planForm = this.fb.group({
      metas: ['', Validators.required],
      herramientas: [''],
      capacitacion: ['', Validators.required],
      documentacion: ['']
    });

    this.cierreForm = this.fb.group({
      justificacion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.idCaso = +params['idCaso'] || 0;
      if (this.idCaso > 0) {
        this.cargarCaso();
        this.cargarDatosPaso3();
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

  cargarDatosPaso3(): void {
    this.planAccionService.obtenerPorCaso(this.idCaso).subscribe({
      next: (data) => {
        this.modoEdicion = true;
        this.idPaso3Existente = data.id_paso3;
        this.planForm.patchValue({
          metas: data.metas_claras,
          herramientas: data.herramientas_necesarias ?? '',
          capacitacion: data.capacitacion_sesion,
          documentacion: data.documentacion_capacitacion ?? ''
        });
      },
      error: () => {
        this.modoEdicion = false;
      }
    });
  }

  onSubmit() {
    if (this.planForm.invalid) {
      this.errorMensaje = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (this.idCaso === 0) {
      this.errorMensaje = 'Error: No se encontró el ID del caso';
      return;
    }

    this.isLoading = true;
    this.errorMensaje = '';

    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || 0;
    const payload: PlanAccionCreateDto = {
      id_caso: this.idCaso,
      metas_claras: this.planForm.value.metas,
      herramientas_necesarias: this.planForm.value.herramientas || null,
      capacitacion_sesion: this.planForm.value.capacitacion,
      documentacion_capacitacion: this.planForm.value.documentacion || null,
      id_usuario_registro: idUsuario
    };

    this.planAccionService.guardarPaso3(payload).subscribe({
      next: (resp) => {
        this.isLoading = false;
        const eraEdicion = this.modoEdicion;
        this.idPaso3Existente = resp.id_paso3;
        this.modoEdicion = true;
        this.notifications.success(`✅ Paso 3 ${eraEdicion ? 'actualizado' : 'guardado'} correctamente`);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMensaje = (typeof err?.error === 'string' ? err.error : (err?.error?.message ?? 'Error al guardar el plan de acción'));
      }
    });
  }

  continuarProceso() {
    if (!this.idPaso3Existente || this.idPaso3Existente === 0) {
      this.errorMensaje = 'Debe guardar el Paso 3 antes de continuar';
      return;
    }

    if (confirm('¿Desea continuar al Paso 4? El Paso 3 quedará marcado como completado.')) {
      this.isLoading = true;
      this.planAccionService.completarPaso3(this.idPaso3Existente).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notifications.success('✅ Paso 3 completado.\nContinuar al paso 4.', {
            title: 'Continuar'
          });
          this.router.navigate(['/evaluar-resultados'], { queryParams: { idCaso: this.idCaso } });
        },
        error: () => {
          this.isLoading = false;
          this.errorMensaje = 'Error al completar el paso';
        }
      });
    }
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    if (this.cierreForm.invalid) {
      this.errorMensaje = 'Debe escribir la justificación de cierre (mín. 10 caracteres)';
      return;
    }

    if (!this.idPaso3Existente || this.idPaso3Existente === 0) {
      this.errorMensaje = 'Guarde primero el Paso 3 antes de cerrar el proceso';
      return;
    }

    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;

    const justificacion = String(this.cierreForm.value.justificacion ?? '').trim();

    this.isLoading = true;
    this.errorMensaje = '';

    const flagKey = 'supports.paso3.cerrar';
    const skipCerrarPaso =
      typeof localStorage !== 'undefined' && localStorage.getItem(flagKey) === 'false';

    (skipCerrarPaso
      ? of({ message: 'El backend no expone /cerrar en Paso 3. Se cerrará el caso directamente.' } as any)
      : this.planAccionService
          .cerrarPaso3(this.idPaso3Existente, {
            justificacion_cierre: justificacion,
            id_usuario_cierre: idUsuario
          })
          .pipe(
            catchError((err) => {
              if (err?.status === 404) {
                try {
                  if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(flagKey, 'false');
                  }
                } catch {
                  // noop
                }
                return of({ message: 'El backend no expone /cerrar en Paso 3. Se cerrará el caso directamente.' } as any);
              }
              throw err;
            })
          )
    )
      .pipe(
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
            'No se pudo cerrar el proceso';
        }
      });
  }
}

