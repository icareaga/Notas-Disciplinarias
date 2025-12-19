import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

  constructor(private fb: FormBuilder) {
    this.notaForm = this.fb.group({
      comportamiento: ['', Validators.required],
      observaciones: ['', Validators.required]
    });
  }

  onSubmit() {
    console.log("Formulario enviado:", this.notaForm.value);
  }

  continuarProceso() {
    console.log("Continuar proceso");
  }

  terminarProceso() {
    this.mostrarTerminarProceso = true;
  }

  enviarCierre() {
    console.log("Cierre enviado");
  }
}
