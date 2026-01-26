import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CasosService } from '../../services/casos.service';
import { NotaIncumplimientoService } from '../../services/nota-incumplimiento.service';
import { EvaluarResultadosService } from '../../services/evaluar-resultados.service';
import { NotaIncumplimientoCreateDto } from '../../models/nota-incumplimiento.model';
import { NavigationButtonsComponent } from '../../shared/navigation-buttons/navigation-buttons.component';

@Component({
  selector: 'app-nota-incumplimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigationButtonsComponent],
  templateUrl: './nota-incumplimiento.component.html',
  styleUrls: ['./nota-incumplimiento.component.scss']
})
export class NotaIncumplimientoComponent {
  notaForm: FormGroup;
  cierreForm: FormGroup;
  mostrarTerminarProceso = false;

  idCaso: number = 0;
  idPaso5Existente: number = 0;
  isLoading = false;
  errorMensaje: string = '';
  modoEdicion = false;
  casoActual: any = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private notaIncumplimientoService: NotaIncumplimientoService,
    private evaluarResultadosService: EvaluarResultadosService,
    private casosService: CasosService,
    private authService: AuthService
  ) {
    this.notaForm = this.fb.group({
      comportamiento: ['', Validators.required],
      observaciones: ['', Validators.required]
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
        this.cargarDatosPaso5();
      }
    });
  }

  cargarCaso(): void {
    this.casosService.obtenerCasoPorId(this.idCaso).subscribe({
      next: (caso) => {
        this.casoActual = caso;
        this.verificarYSincronizarPasoEnBD();
      },
      error: () => {
        this.errorMensaje = 'No se pudo cargar el caso';
      }
    });
  }

  private verificarYSincronizarPasoEnBD(): void {
    const paso = Number(
      this.casoActual?.id_paso ?? this.casoActual?.IdPaso ?? this.casoActual?.idPaso ?? 0
    );
    if (!paso) return;
    if (paso >= 5) return;

    // Si el caso sigue en Paso 4 pero el usuario ya está en la pantalla del Paso 5,
    // ofrecemos sincronizar completando el Paso 4 para que Casos.id_paso se actualice.
    if (paso === 4) {
      const confirmar = confirm(
        'Este caso aún aparece en el Paso 4 en la base de datos.\n\n¿Deseas completar el Paso 4 y avanzar a Paso 5 para sincronizar el flujo?'
      );
      if (!confirmar) return;

      this.isLoading = true;
      this.errorMensaje = '';

      this.evaluarResultadosService.obtenerPorCaso(this.idCaso).subscribe({
        next: (p4: any) => {
          const idPaso4 = Number(p4?.id_paso4 ?? 0);
          if (!idPaso4) {
            this.isLoading = false;
            this.errorMensaje = 'No se encontró el registro del Paso 4 para poder sincronizar.';
            return;
          }

          this.evaluarResultadosService.completarPaso4(idPaso4).subscribe({
            next: () => {
              this.isLoading = false;
              // Recargar caso para ver el id_paso actualizado
              this.cargarCaso();
            },
            error: (err) => {
              this.isLoading = false;
              const details =
                (typeof err?.error === 'string'
                  ? err.error
                  : (err?.error?.message ?? err?.error?.title ?? '')) || '';
              this.errorMensaje = `No se pudo sincronizar el paso en BD. ${details}`.trim();
            }
          });
        },
        error: (err) => {
          this.isLoading = false;
          const details =
            (typeof err?.error === 'string'
              ? err.error
              : (err?.error?.message ?? err?.error?.title ?? '')) || '';
          this.errorMensaje = `No se pudo obtener el Paso 4 para sincronizar. ${details}`.trim();
        }
      });

      return;
    }

    this.errorMensaje = `Este caso aún está en el Paso ${paso}. Regresa al paso correspondiente antes de capturar la Nota de Incumplimiento.`;
  }

  cargarDatosPaso5(): void {
    this.notaIncumplimientoService.obtenerPorCaso(this.idCaso).subscribe({
      next: (data) => {
        this.modoEdicion = true;
        this.idPaso5Existente = data.id_paso5;
        this.notaForm.patchValue({
          comportamiento: data.comportamiento,
          observaciones: data.observaciones
        });
      },
      error: () => {
        this.modoEdicion = false;
      }
    });
  }

  onSubmit() {
    if (this.notaForm.invalid) {
      this.errorMensaje = 'Por favor complete todos los campos requeridos';
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

    const payload: NotaIncumplimientoCreateDto = {
      id_caso: this.idCaso,
      comportamiento: this.notaForm.value.comportamiento,
      observaciones: this.notaForm.value.observaciones,
      id_usuario_registro: idUsuario
    };

    this.notaIncumplimientoService.guardarPaso5(payload).subscribe({
      next: (resp) => {
        this.isLoading = false;
        this.idPaso5Existente = resp.id_paso5;
        this.modoEdicion = true;
        alert(`✅ Paso 5 ${eraEdicion ? 'actualizado' : 'guardado'} correctamente`);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMensaje =
          (typeof err?.error === 'string'
            ? err.error
            : (err?.error?.message ?? 'Error al guardar la nota de incumplimiento'));
      }
    });
  }

  continuarProceso() {
    if (!this.idPaso5Existente || this.idPaso5Existente === 0) {
      this.errorMensaje = 'Debe guardar el Paso 5 antes de continuar';
      return;
    }

    if (confirm('¿Desea continuar al Paso 6? El Paso 5 quedará marcado como completado.')) {
      this.isLoading = true;
      this.notaIncumplimientoService.completarPaso5(this.idPaso5Existente).subscribe({
        next: (response) => {
          this.isLoading = false;
          alert(`✅ ${response.message}`);
          this.router.navigate(['/acta-administrativa'], { queryParams: { idCaso: this.idCaso } });
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

    if (!this.idPaso5Existente || this.idPaso5Existente === 0) {
      this.errorMensaje = 'Guarde primero el Paso 5 antes de cerrar el proceso';
      return;
    }

    const info = this.authService.getTokenInfo();
    const idUsuario = Number((info as any)?.Id ?? (info as any)?.UserId ?? 0) || null;

    this.isLoading = true;
    this.notaIncumplimientoService
      .cerrarPaso5(this.idPaso5Existente, { justificacion_cierre: this.cierreForm.value.justificacion, id_usuario_cierre: idUsuario })
      .subscribe({
        next: (resp) => {
          this.isLoading = false;
          alert(`✅ ${resp.message}`);
        },
        error: () => {
          this.isLoading = false;
          this.errorMensaje = 'No se pudo cerrar el proceso';
        }
      });
  }
}
