import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CasosService } from "../../../services/casos.service";

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

export class UsuarioComponent implements OnInit {

  // 🔹 Catálogo de pasos reales del proceso
  pasos = [
    'Señalar Problema',
    'Determinar Causa',
    'Plan de Acción',
    'Evaluar Resultados',
    'Nota de Incumplimiento',
    'Acta Administrativa'
  ];

  // 🔹 Caso asignado
  caso: CasoUsuario | null = null;

  // 🔹 Historial de casos anteriores
  historialCasos: CasoUsuario[] = [];

  constructor(private casosService: CasosService) {}

  ngOnInit(): void {
    const idUsuario = 1; // TODO: Obtener del login/auth
    this.casosService.obtenerCasosPorUsuario(idUsuario).subscribe({
      next: (casos: any[]) => {
        if (casos.length > 0) {
          // Asumir el caso actual es el primero con estado 'En proceso'
          const casoActual = casos.find(c => c.estado === 'En proceso') || casos[0];
          this.caso = {
            id: casoActual.id,
            motivo: casoActual.motivo,
            descripcion: casoActual.descripcion,
            pasoActual: casoActual.estado === 'En proceso' ? 'Evaluar Resultados' : 'Completado', // Lógica simple
            fechaCreacion: new Date(casoActual.fechaCreacion).toLocaleDateString(),
            estado: casoActual.estado
          };
          // Historial: los demás casos
          this.historialCasos = casos.filter(c => c.id !== casoActual.id).map(c => ({
            id: c.id,
            motivo: c.motivo,
            descripcion: c.descripcion,
            pasoActual: c.estado, // Para historial, usar estado como pasoActual
            fechaCreacion: new Date(c.fechaCreacion).toLocaleDateString(),
            estado: c.estado
          }));
        }
      },
      error: (err) => {
        console.error('Error al obtener casos:', err);
        // Mantener datos simulados o mostrar error
      }
    });
  }

  // Validar si un paso es el actual
  esPasoActual(paso: string): boolean {
    return this.caso ? paso === this.caso.pasoActual : false;
  }
}
