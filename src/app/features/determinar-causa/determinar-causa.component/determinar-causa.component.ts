import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-determinar-causa',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './determinar-causa.component.html',
  styleUrls: ['./determinar-causa.component.scss']
})
export class DeterminarCausaComponent {
  causaForm: FormGroup;
  mostrarTerminarProceso = false;

  constructor(private fb: FormBuilder) {
    this.causaForm = this.fb.group({
      causasIdentificadas: ['', Validators.required],
      evidencia: [''],
      comentarios: ['']
    });
  }

  onSubmit() {
    if (this.causaForm.valid) {
      console.log('Formulario enviado:', this.causaForm.value);
      alert('Causa registrada correctamente ✅');
    }
  }

  continuarProceso() {
    alert('Redirigiendo al siguiente paso...');
    // Aquí luego conectamos con la ruta del paso 3
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    alert('Proceso terminado. Justificación enviada ✅');
    console.log('Justificación:', this.causaForm.value);
  }
}
