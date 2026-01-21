import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CasoCreate } from '../../../models/caso-create.model';
import { CasosService } from '../../../services/casos.service';

type EstadoPaso =
  | 'SENALAR_PROBLEMA'
  | 'DETERMINAR_CAUSA'
  | 'PLAN_ACCION'
  | 'EVALUAR_RESULTADOS'
  | 'NOTA_INCUMPLIMIENTO'
  | 'ACTA_ADMINISTRATIVA';

interface CasoUI {
  id: number;
  empleado: string;
  motivo: string;
  levantadoPor: string;
  pasoActual: string;       // Texto visible del paso
  estado: EstadoPaso;       // Clave de filtro
  estadoEtiqueta: string;   // Texto visible del estado
  fecha: string | Date;
  // cualquier campo extra que necesites...
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  // Datos crudos del servicio:
  casos: CasoUI[] = [];

  // Para la vista:
  casosFiltrados: CasoUI[] = [];
  textoBusqueda = '';
  filtroEstado: 'TODOS' | EstadoPaso = 'TODOS';

  // Conteos para los badges:
  conteos = {
    todos: 0,
    senalarProblema: 0,
    determinarCausa: 0,
    planAccion: 0,
    evaluarResultados: 0,
    notaIncumplimiento: 0,
    actaAdministrativa: 0
  };

  // Formulario crear caso:
    nuevoCaso: CasoCreate = {
    idUsuarioAfectado: 0,
    idCategoria: 0,
    descripcion: '',
    impacto: '',
    conducta: ''
  };

  constructor(private casosService: CasosService) {}

  ngOnInit(): void {
    this.cargarCasos();
  }

  /** Carga desde servicio y normaliza al modelo de UI */
  cargarCasos(): void {
    this.casosService.obtenerCasos().subscribe({
      next: (data: any[]) => {
        // Mapea los campos reales del backend a CasoUI:
        this.casos = data.map(item => this.mapearCaso(item));
        this.actualizarConteos();
        this.aplicarFiltros();
      },
      error: () => alert('Error al cargar casos')
    });
  }

  /** Ajusta el caso a la forma necesaria en interfaz */
  private mapearCaso(item: any): CasoUI {
    const estado = this.mapEstatusToEstado(item.Estatus);

    return {
      id: item.IdCaso,
      empleado: item.Empleado,
      motivo: item.Categoria,
      levantadoPor: 'Admin', // Placeholder, ajusta si tienes el campo
      pasoActual: this.etiquetaPaso(estado),
      estado,
      estadoEtiqueta: this.etiquetaEstado(estado),
      fecha: item.FechaRegistro
    };
  }

  /** Mapea Estatus del API a EstadoPaso */
  private mapEstatusToEstado(estatus: string): EstadoPaso {
    switch (estatus) {
      case '1': return 'SENALAR_PROBLEMA';
      case '2': return 'DETERMINAR_CAUSA';
      case '3': return 'PLAN_ACCION';
      case '4': return 'EVALUAR_RESULTADOS';
      case '5': return 'NOTA_INCUMPLIMIENTO';
      case '6': return 'ACTA_ADMINISTRATIVA';
      default: return 'SENALAR_PROBLEMA';
    }
  }

  /** Devuelve texto para mostrar del paso actual */
  private etiquetaPaso(pasoClave: string): string {
    const mapa: Record<string, string> = {
      SENALAR_PROBLEMA: 'Senalar Problema',
      DETERMINAR_CAUSA: 'Determinar Causa',
      PLAN_ACCION: 'Plan de Acción',
      EVALUAR_RESULTADOS: 'Evaluar Resultados',
      NOTA_INCUMPLIMIENTO: 'Nota de Incumplimiento',
      ACTA_ADMINISTRATIVA: 'Acta Administrativa'
    };
    return mapa[pasoClave] ?? '—';
  }

  /** Devuelve texto para mostrar del estado */
  private etiquetaEstado(estado: EstadoPaso): string {
    const mapa: Record<EstadoPaso, string> = {
      SENALAR_PROBLEMA: 'Senalar Problema',
      DETERMINAR_CAUSA: 'Determinar Causa',
      PLAN_ACCION: 'Plan de Acción',
      EVALUAR_RESULTADOS: 'Evaluar Resultados',
      NOTA_INCUMPLIMIENTO: 'Nota Incumplimiento',
      ACTA_ADMINISTRATIVA: 'Acta Administrativa'
    };
    return mapa[estado] ?? '—';
  }

  /** Actualiza los badges */
  private actualizarConteos(): void {
    const contar = (clave: EstadoPaso) =>
      this.casos.filter(c => c.estado === clave).length;

    this.conteos = {
      todos: this.casos.length,
      senalarProblema: contar('SENALAR_PROBLEMA'),
      determinarCausa: contar('DETERMINAR_CAUSA'),
      planAccion: contar('PLAN_ACCION'),
      evaluarResultados: contar('EVALUAR_RESULTADOS'),
      notaIncumplimiento: contar('NOTA_INCUMPLIMIENTO'),
      actaAdministrativa: contar('ACTA_ADMINISTRATIVA')
    };
  }

  /** Cambia filtro de estado/paso */
  setFiltro(estado: 'TODOS' | EstadoPaso): void {
    this.filtroEstado = estado;
    this.aplicarFiltros();
  }

  /** Aplica filtro por texto y estado */
  aplicarFiltros(): void {
    const texto = (this.textoBusqueda || '').toLowerCase().trim();

    this.casosFiltrados = this.casos
      .filter(c => {
        const porEstado = this.filtroEstado === 'TODOS' || c.estado === this.filtroEstado;
        const porTexto =
          !texto ||
          c.empleado.toLowerCase().includes(texto) ||
          c.motivo.toLowerCase().includes(texto) ||
          c.levantadoPor.toLowerCase().includes(texto);
        return porEstado && porTexto;
      });
  }

  /** Crear caso (con tu servicio) */
  crearCaso(): void {
    if (
      !this.nuevoCaso.idUsuarioAfectado ||
      !this.nuevoCaso.idCategoria ||
      !this.nuevoCaso.descripcion.trim()
    ) {
      alert('Completa todos los campos');
      return;
    }

    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: () => {
        this.nuevoCaso = { idUsuarioAfectado: 0, idCategoria: 0, descripcion: '', impacto: '', conducta: '' };
        this.cargarCasos();
      },
      error: () => alert('Error al crear el caso')
    });
  }

  /** Descarga PDF del caso (ajusta a tu backend/route) */
  descargarPDF(caso: CasoUI): void {
    // Si tu servicio ya devuelve URL:
    // window.open(`/api/casos/${caso.id}/pdf`, '_blank');
    this.casosService.descargarPDF(caso.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Caso_${caso.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => alert('No se pudo descargar el PDF')
    });
  }

  /** Exporta tabla a Excel (CSV sencillo) */
  exportarExcel(): void {
    const encabezados = ['ID','Empleado','Motivo','Levantado Por','Paso Actual','Estado','Fecha'];
    const filas = this.casosFiltrados.map(c => [
      c.id,
      c.empleado,
      c.motivo,
      c.levantadoPor,
      c.pasoActual,
      c.estadoEtiqueta,
      typeof c.fecha === 'string' ? c.fecha : (c.fecha as Date).toISOString().slice(0, 10)
    ]);

    const csv = [encabezados, ...filas]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'casos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
