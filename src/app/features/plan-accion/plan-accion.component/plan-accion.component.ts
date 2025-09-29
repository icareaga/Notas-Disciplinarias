import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan-accion',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './plan-accion.component.html',
  styleUrls: ['./plan-accion.component.scss']
})
export class PlanAccionComponent {
  planForm: FormGroup;
  mostrarTerminarProceso = false;

  constructor(private fb: FormBuilder) {
    this.planForm = this.fb.group({
      metas: ['', Validators.required],
      herramientas: [''],
      capacitacion: ['', Validators.required],
      documentacion: ['']
    });
  }

  onSubmit() {
    if (this.planForm.valid) {
      console.log('Plan de acción guardado:', this.planForm.value);
      alert('✅ Plan de acción registrado correctamente');
    }
  }

  continuarProceso() {
    alert('Redirigiendo al paso 4...');
    // Aquí conectaremos con la ruta de evaluar-resultados
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    alert('❌ Proceso finalizado con justificación enviada');
  }
}

