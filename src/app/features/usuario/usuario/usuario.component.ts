import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

interface CasoUsuario {
  id: number;
  motivo: string;
  descripcion: string;
  pasoActual: string;
  fechaCreacion: string;
  estado: string;  // En proceso, Completado, Detenido
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
})

export class UsuarioComponent {

  // 🔹 Catálogo de pasos reales del proceso
  pasos = [
    'Señalar Problema',
    'Determinar Causa',
    'Plan de Acción',
    'Evaluar Resultados',
    'Nota de Incumplimiento',
    'Acta Administrativa'
  ];

  // 🔹 Caso asignado (simulado por ahora)
  caso: CasoUsuario = {
    id: 1023,
    motivo: 'Retardos',
    descripcion: 'El colaborador acumula más de 5 retardos en el mes.',
    pasoActual: 'Evaluar Resultados',
    fechaCreacion: '2025-01-12',
    estado: 'En proceso'
  };

  // Validar si un paso es el actual
  esPasoActual(paso: string): boolean {
    return paso === this.caso.pasoActual;
  }
}
