import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CasosService } from '../../../services/casos.service';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';

type EstadoPaso =
  | 'senalar_problema'
  | 'determinar_causa'
  | 'plan_accion'
  | 'evaluar_resultados'
  | 'nota_incumplimiento'
  | 'acta_administrativa';

interface CasoUsuario {
  id: number;
  motivo: string;
  estado: EstadoPaso;
  estatusCaso: number;
  fecha: string | Date;
  descripcion?: string;
  impacto?: string;
  conducta?: string;
  pasoActual: number;
  pasoActualTexto: string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, DatePipe, NavigationButtonsComponent],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss'],
})
export class UsuarioComponent implements OnInit {
  casos: CasoUsuario[] = [];
  mostrarModal = false;
  casoSeleccionado: CasoUsuario | null = null;

  constructor(
    private casosService: CasosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarCasos();
  }

  cargarCasos(): void {
    const tokenInfo = this.authService.getTokenInfo();
    const usuarioIdRaw = tokenInfo?.Id ?? tokenInfo?.UserId;
    // El token puede traer el ID como string o number (depende del emisor/claim).
    const usuarioId = Number(usuarioIdRaw);

    if (!usuarioIdRaw || Number.isNaN(usuarioId)) {
      console.error('No se pudo obtener el ID del usuario');
      this.casos = [];
      return;
    }

    this.casosService.obtenerCasosPorUsuario(usuarioId).subscribe({
      next: (data: any[]) => {
        this.casos = (data || []).map((c) => this.mapearCaso(c));
      },
      error: (err) => {
        console.error('Error al cargar casos del usuario', err);
        this.casos = [];
      },
    });
  }

  private mapearCaso(c: any): CasoUsuario {
    const id = Number(c?.id_caso ?? c?.IdCaso ?? c?.idCaso ?? c?.id ?? 0);
    // En el backend el avance del flujo viene en id_paso (1..6). `estatus` es 1=Activo / 0=Cerrado.
    const pasoActual = Number(c?.id_paso ?? c?.IdPaso ?? c?.idPaso ?? 1);
    const estado = this.estadoPorPaso(pasoActual);

    return {
      id,
      motivo: c.categoria || 'Sin categoría',
      estado,
      estatusCaso: Number(c?.estatus ?? 1),
      fecha: c?.fecha_registro ?? c?.fechaRegistro ?? c?.fecha ?? new Date(),
      descripcion: c.descripcion,
      impacto: c.impacto,
      conducta: c.conducta,
      pasoActual,
      pasoActualTexto: this.etiquetaPaso(estado),
    };
  }

  verCaso(caso: CasoUsuario): void {
    this.casoSeleccionado = caso;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.casoSeleccionado = null;
  }

  private estadoPorPaso(paso: number): EstadoPaso {
    switch (paso) {
      case 1:
        return 'senalar_problema';
      case 2:
        return 'determinar_causa';
      case 3:
        return 'plan_accion';
      case 4:
        return 'evaluar_resultados';
      case 5:
        return 'nota_incumplimiento';
      case 6:
        return 'acta_administrativa';
      default:
        return 'senalar_problema';
    }
  }

  private etiquetaPaso(estado: EstadoPaso): string {
    switch (estado) {
      case 'senalar_problema':
        return 'Señalar problema';
      case 'determinar_causa':
        return 'Determinar causa';
      case 'plan_accion':
        return 'Plan de acción';
      case 'evaluar_resultados':
        return 'Evaluar resultados';
      case 'nota_incumplimiento':
        return 'Nota de incumplimiento';
      case 'acta_administrativa':
        return 'Acta administrativa';
      default:
        return 'Señalar problema';
    }
  }
}
