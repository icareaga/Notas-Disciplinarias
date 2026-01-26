import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CasosService } from '../../../services/casos.service';
import { AuthService } from '../../../services/auth.service';
import { EvaluarResultadosService } from '../../../services/evaluar-resultados.service';
import { EvaluarResultadosCreateDto } from '../../../models/evaluar-resultados.model';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';
import { NotificationsService } from '../../../shared/notifications/notifications.service';

@Component({
  selector: 'app-evaluar-resultados',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavigationButtonsComponent],
  templateUrl: './evaluar-resultados.component.html',
  styleUrls: ['./evaluar-resultados.component.scss']
})
export class EvaluarResultadosComponent {
  evaluacionForm: FormGroup;
  cierreForm: FormGroup;
  mostrarTerminarProceso = false;
  idCaso: number = 0;
  idPaso4Existente: number = 0;
  isLoading = false;
  errorMensaje: string = '';
  modoEdicion = false;
  casoActual: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private evaluarResultadosService: EvaluarResultadosService,
    private casosService: CasosService,
    private authService: AuthService,
    private notifications: NotificationsService
  ) {
    this.evaluacionForm = this.fb.group({
      sesion: ['', Validators.required],
      comparacion: ['', Validators.required],
      avances: [''],
      compromisos: ['']
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
        this.cargarDatosPaso4();
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

  cargarDatosPaso4(): void {
    this.evaluarResultadosService.obtenerPorCaso(this.idCaso).subscribe({
      next: (data) => {
        this.modoEdicion = true;
        this.idPaso4Existente = data.id_paso4;
        this.evaluacionForm.patchValue({
          sesion: data.sesion_privada,
          comparacion: data.comparacion,
          avances: data.avances ?? '',
          compromisos: data.compromisos ?? ''
        });
      },
      error: () => {
        this.modoEdicion = false;
      }
    });
  }

  onSubmit() {
    if (this.evaluacionForm.invalid) {
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
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;

    const payload: EvaluarResultadosCreateDto = {
      id_caso: this.idCaso,
      sesion_privada: this.evaluacionForm.value.sesion,
      comparacion: this.evaluacionForm.value.comparacion,
      avances: this.evaluacionForm.value.avances || null,
      compromisos: this.evaluacionForm.value.compromisos || null,
      id_usuario_registro: idUsuario
    };

    this.evaluarResultadosService.guardarPaso4(payload).subscribe({
      next: (resp) => {
        this.isLoading = false;
        const eraEdicion = this.modoEdicion;
        this.idPaso4Existente = resp.id_paso4;
        this.modoEdicion = true;
        this.notifications.success(`✅ Paso 4 ${eraEdicion ? 'actualizado' : 'guardado'} correctamente`);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMensaje =
          (typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? 'Error al guardar la evaluación de resultados'));
      }
    });
  }

  continuarProceso() {
    if (!this.idPaso4Existente || this.idPaso4Existente === 0) {
      this.errorMensaje = 'Debe guardar el Paso 4 antes de continuar';
      return;
    }

    if (confirm('¿Desea continuar al Paso 5? El Paso 4 quedará marcado como completado.')) {
      this.isLoading = true;
      this.evaluarResultadosService.completarPaso4(this.idPaso4Existente).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.notifications.success('✅ Paso 4 completado.\nContinuar al paso 5.', {
            title: 'Continuar'
          });
          this.router.navigate(['/nota-incumplimiento'], { queryParams: { idCaso: this.idCaso } });
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
      this.errorMensaje = 'Debe escribir la justificación de cierre';
      return;
    }

    if (!this.idPaso4Existente || this.idPaso4Existente === 0) {
      this.errorMensaje = 'Guarde primero el Paso 4 antes de cerrar el proceso';
      return;
    }

    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;
    const justificacion = String(this.cierreForm.value.justificacion ?? '').trim();

    this.isLoading = true;
    this.evaluarResultadosService
      .cerrarPaso4(this.idPaso4Existente, { justificacion_cierre: justificacion })
      // Además de cerrar el paso, cerramos el caso para asegurar Casos.estatus=0.
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            return of({ message: 'El backend no expone /cerrar en Paso 4. Se cerrará el caso directamente.' } as any);
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
        error: () => {
          this.isLoading = false;
          this.errorMensaje = 'No se pudo cerrar el proceso';
        }
      });
  }
}
