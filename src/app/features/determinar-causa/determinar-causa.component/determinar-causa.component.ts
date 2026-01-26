import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeterminarCausaService } from '../../../services/determinar-causa.service';
import { CasosService } from '../../../services/casos.service';
import { DeterminarCausaCreateDto } from '../../../models/determinar-causa.model';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';

@Component({
  selector: 'app-determinar-causa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NavigationButtonsComponent],
  templateUrl: './determinar-causa.component.html',
  styleUrls: ['./determinar-causa.component.scss']
})
export class DeterminarCausaComponent implements OnInit {
  causaForm: FormGroup;
  mostrarTerminarProceso = false;
  idCaso: number = 0;
  idPaso2Existente: number = 0; // Si > 0, estamos editando
  archivosSeleccionados: File[] = [];
  isLoading = false;
  errorMensaje: string = '';
  modoEdicion = false; // Indica si está editando un registro existente
  casoActual: any = null; // Datos del caso (Paso 1)

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private determinarCausaService: DeterminarCausaService,
    private casosService: CasosService
  ) {
    this.causaForm = this.fb.group({
      causasIdentificadas: ['', [Validators.required, Validators.minLength(10)]],
      comentarios: ['']
    });
  }

  ngOnInit() {
    // Obtener id_caso de la ruta o estado
    this.route.queryParams.subscribe(params => {
      this.idCaso = +params['idCaso'] || 0;
      if (this.idCaso > 0) {
        this.cargarCaso();
        this.cargarDatosPaso2();
      }
    });
  }

  /**
   * Carga los datos del caso (Paso 1)
   */
  cargarCaso() {
    this.casosService.obtenerCasoPorId(this.idCaso).subscribe({
      next: (caso) => {
        this.casoActual = caso;
        console.log('📋 Caso cargado:', caso);
      },
      error: (err) => {
        console.error('❌ Error al cargar caso:', err);
        this.errorMensaje = 'No se pudo cargar el caso';
      }
    });
  }

  /**
   * Carga los datos existentes del Paso 2 si ya fueron guardados previamente
   */
  cargarDatosPaso2() {
    this.determinarCausaService.obtenerPorCaso(this.idCaso).subscribe({
      next: (data) => {
        this.modoEdicion = true;
        this.idPaso2Existente = data.id_paso2;
        
        this.causaForm.patchValue({
          causasIdentificadas: data.causas_identificadas,
          comentarios: data.comentarios_adicionales
        });
        
        console.log('📝 Modo edición activado - Paso 2 ya existe');
      },
      error: (err) => {
        // Si no existe registro previo, está OK (primera vez en Paso 2
        // Si no existe registro previo, está OK (primera vez)
        this.modoEdicion = false;
        console.log('✨ Modo creación - Primera vez en Paso 2');
      }
    });
  }

  /**
   * Maneja la selección de archivos
   */
  onFileSelect(event: any) {
    const files: FileList = event.target.files;
    this.errorMensaje = '';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validacion = this.determinarCausaService.validarArchivo(file);

      if (!validacion.valido) {
        this.errorMensaje = validacion.error || 'Archivo inválido';
        return;
      }

      this.archivosSeleccionados.push(file);
    }
  }

  /**
   * Elimina un archivo de la lista de seleccionados
   */
  eliminarArchivo(index: number) {
    this.archivosSeleccionados.splice(index, 1);
  }

  /**
   * Formatea el tamaño del archivo en KB/MB
   */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /**
   * Guarda los datos del Paso 2 y las evidencias
   * Primero guarda el paso2, luego sube las evidencias una por una
   */
  onSubmit() {
    if (this.causaForm.invalid) {
      this.errorMensaje = 'Por favor complete todos los campos requeridos';
      return;
    }

    if (this.idCaso === 0) {
      this.errorMensaje = 'Error: No se encontró el ID del caso';
      return;
    }

    this.isLoading = true;
    this.errorMensaje = '';

    // Obtener ID de usuario del localStorage (si está implementado)
    const idUsuario = 0; // TODO: Obtener del token JWT o localStorage

    const datos: DeterminarCausaCreateDto = {
      id_caso: this.idCaso,
      causas_identificadas: this.causaForm.value.causasIdentificadas,
      comentarios_adicionales: this.causaForm.value.comentarios || undefined,
      id_usuario_registro: idUsuario
    };

    // Guardar paso 2 + evidencias (el servicio maneja todo)
    this.determinarCausaService.guardarCompleto(datos, this.archivosSeleccionados, idUsuario).subscribe({
      next: (result) => {
        this.isLoading = false;
        const totalEvidencias = result.evidencias.length;
        
        // Guardar el ID del paso 2 para poder continuar después
        this.idPaso2Existente = result.paso2.id_paso2;
        this.modoEdicion = true;
        
        alert(`✅ Paso 2 ${this.modoEdicion ? 'actualizado' : 'guardado'} correctamente\n${totalEvidencias} evidencia(s) subida(s)`);
        
        // Limpiar archivos seleccionados
        this.archivosSeleccionados = [];
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMensaje = err.error || 'Error al guardar los datos';
        console.error('Error:', err);
      }
    });
  }

  /**
   * Continuar al siguiente paso
   * Marca este paso como completado (estatus = 0) y habilita el siguiente
   */
  continuarProceso() {
    if (!this.idPaso2Existente || this.idPaso2Existente === 0) {
      this.errorMensaje = 'Debe guardar el Paso 2 antes de continuar';
      return;
    }

    if (confirm('¿Desea continuar al Paso 3? El Paso 2 quedará marcado como completado.')) {
      this.isLoading = true;
      
      // Llamar endpoint para completar paso 2 y actualizar estatus
      this.determinarCausaService.completarPaso2(this.idPaso2Existente).subscribe({
        next: (response) => {
          this.isLoading = false;
          alert(`✅ ${response.message}`);
          // Navegar al Paso 3
          this.router.navigate(['/plan-accion'], { queryParams: { idCaso: this.idCaso } });
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMensaje = 'Error al completar el paso';
          console.error('Error:', err);
        }
      });
    }
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    alert('Proceso terminado. Justificación enviada ✅');
    console.log('Justificación:', this.causaForm.value);
    // TODO: Implementar endpoint de cierre de caso
  }
}
