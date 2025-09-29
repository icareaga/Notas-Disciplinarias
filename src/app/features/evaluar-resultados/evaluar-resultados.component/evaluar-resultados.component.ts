import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-evaluar-resultados',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './evaluar-resultados.component.html',
  styleUrls: ['./evaluar-resultados.component.scss']
})
export class EvaluarResultadosComponent {
  evaluacionForm: FormGroup;
  mostrarTerminarProceso = false;

  constructor(private fb: FormBuilder) {
    this.evaluacionForm = this.fb.group({
      sesion: ['', Validators.required],
      comparacion: ['', Validators.required],
      avances: [''],
      compromisos: ['']
    });
  }

  onSubmit() {
    if (this.evaluacionForm.valid) {
      console.log('Evaluación registrada:', this.evaluacionForm.value);
      alert('✅ Evaluación de resultados guardada correctamente');
    }
  }

  continuarProceso() {
    alert('Redirigiendo al paso 5...');
    // Aquí enlazaremos con la ruta de acta-administrativa
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    alert('❌ Proceso finalizado en la etapa de Evaluar Resultados');
  }
}
