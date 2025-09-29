import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nota-incumplimiento',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nota-incumplimiento.component.html',
  styleUrls: ['./nota-incumplimiento.component.scss']
})
export class NotaIncumplimientoComponent {
  notaForm: FormGroup;
  mostrarTerminarProceso = false;

  constructor(private fb: FormBuilder, private router: Router) {
    this.notaForm = this.fb.group({
      comportamiento: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.notaForm.valid) {
      console.log('Nota de incumplimiento registrada:', this.notaForm.value);
      alert('⚠️ Nota de incumplimiento registrada correctamente');
    }
  }

  continuarProceso() {
    this.router.navigate(['/acta-administrativa']); // Paso 6 (último)
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    alert('❌ Proceso finalizado en la etapa de Nota de Incumplimiento');
  }
}
