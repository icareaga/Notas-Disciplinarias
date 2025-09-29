import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-acta-administrativa',
  templateUrl: './acta-administrativa.component.html',
  styleUrls: ['./acta-administrativa.component.scss']
})
export class ActaAdministrativaComponent {
  actaForm: FormGroup;
  actaGuardada: boolean = false;

  constructor(private fb: FormBuilder) {
    // Inicializamos el formulario con validaciones
    this.actaForm = this.fb.group({
      colaborador: ['', Validators.required],
      historial: ['', Validators.required],
      evidencias: [''],
      versionColaborador: [''],
      firmas: ['']
    });
  }

  // Método para guardar el acta
  onSubmit() {
    if (this.actaForm.valid) {
      console.log('✅ Acta Administrativa registrada:', this.actaForm.value);
      this.actaGuardada = true;

      // Aquí luego puedes conectarlo con backend o API
    } else {
      console.log('❌ Formulario inválido');
      this.actaForm.markAllAsTouched();
    }
  }

  // Método para cancelar
  onCancel() {
    this.actaForm.reset();
    this.actaGuardada = false;
    console.log('⚠️ Registro cancelado');
  }
}
