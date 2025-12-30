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

  // 🔹 Historial de casos anteriores
  historialCasos: CasoUsuario[] = [
    {
      id: 987,
      motivo: 'Falta de puntualidad',
      descripcion: 'Tres llegadas tarde en una semana.',
      pasoActual: 'Completado',
      fechaCreacion: '2024-11-15',
      estado: 'Completado'
    },
    {
      id: 654,
      motivo: 'Uso inadecuado de recursos',
      descripcion: 'Uso personal del equipo de trabajo.',
      pasoActual: 'Completado',
      fechaCreacion: '2024-08-20',
      estado: 'Completado'
    },
    {
      id: 321,
      motivo: 'Incumplimiento de políticas',
      descripcion: 'Violación de código de conducta.',
      pasoActual: 'Detenido',
      fechaCreacion: '2024-05-10',
      estado: 'Detenido'
    }
  ];

  // Validar si un paso es el actual
  esPasoActual(paso: string): boolean {
    return paso === this.caso.pasoActual;
  }
}
