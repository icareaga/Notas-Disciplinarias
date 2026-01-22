import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { CasosService } from "../../../services/casos.service";
import { AuthService } from "../../../services/auth.service";
import { NavigationButtonsComponent } from "../../../shared/navigation-buttons/navigation-buttons.component";

type EstadoPaso = 'senalar_problema' | 'determinar_causa' | 'plan_accion' | 'evaluar_resultados' | 'nota_incumplimiento' | 'acta_administrativa';

interface CasoUsuario {
  id: number;
  motivo: string;
  pasoActual: number;
  pasoActualTexto: string;
  fecha: string | Date;
  estado: EstadoPaso;
  estatusCaso?: number;  // 1 = Activo, 0 = Cerrado
  descripcion?: string;
  impacto?: string;
  conducta?: string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [CommonModule, DatePipe, NavigationButtonsComponent],
  templateUrl: './usuario.component.html',
  styleUrls: ['./usuario.component.scss']
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
    const usuarioId = tokenInfo?.Id || tokenInfo?.UserId;

    if (!usuarioId) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }

    this.casosService.obtenerCasosPorUsuario(Number(usuarioId)).subscribe({
      next: (casos: any[]) => {
        this.casos = casos.map(c => this.mapearCaso(c));
      },
      error: (err) => {
        console.error('Error al cargar casos:', err);
      }
    });
  }

  mapearCaso(c: any): CasoUsuario {
    const pasoActual = c.estatus || 1;
    const estado = this.estadoPorPaso(pasoActual);
    
    return {
      id: c.id_caso,
      motivo: c.categoria || 'Sin categoría',
      pasoActual,
      pasoActualTexto: this.etiquetaPaso(estado),
      fecha: c.fecha_registro || new Date(),
      estado,
      estatusCaso: c.estatus || 1,
      descripcion: c.descripcion,
      impacto: c.impacto,
      conducta: c.conducta
    };
  }

  estadoPorPaso(paso: number): EstadoPaso {
    const mapa: Record<number, EstadoPaso> = {
      1: 'senalar_problema',
      2: 'determinar_causa',
      3: 'plan_accion',
      4: 'evaluar_resultados',
      5: 'nota_incumplimiento',
      6: 'acta_administrativa'
    };
    return mapa[paso] || 'senalar_problema';
  }

  etiquetaPaso(paso: EstadoPaso): string {
    const etiquetas: Record<EstadoPaso, string> = {
      senalar_problema: 'Señalar Problema',
      determinar_causa: 'Determinar Causa',
      plan_accion: 'Plan de Acción',
      evaluar_resultados: 'Evaluar Resultados',
      nota_incumplimiento: 'Nota Incumplimiento',
      acta_administrativa: 'Acta Administrativa'
    };
    return etiquetas[paso] || 'Desconocido';
  }

  verCaso(caso: CasoUsuario): void {
    this.casoSeleccionado = caso;
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.casoSeleccionado = null;
  }
}
