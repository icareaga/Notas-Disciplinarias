import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-senalar-problema',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './senalar-problema.component.html',
  styleUrls: ['./senalar-problema.component.scss']
})
export class SenalarProblemaComponent {
  problemaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.problemaForm = this.fb.group({
      colaborador: ['', Validators.required],
      kpi: [''],
      descripcion: ['', Validators.required],
      fecha: ['', Validators.required],
      impacto: [''],
      conducta: ['']
    });
  }

  onSubmit() {
    if (this.problemaForm.valid) {
      console.log('Formulario enviado:', this.problemaForm.value);
      alert('✅ Problema señalado correctamente');
      this.problemaForm.reset();
    } else {
      alert('⚠️ Por favor completa los campos obligatorios');
    }
  }
}
