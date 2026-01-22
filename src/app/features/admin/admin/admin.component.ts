import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CasoCreate } from '../../../models/caso-create.model';
import { CasosService } from '../../../services/casos.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';

type EstadoPaso =
  | 'SENALAR_PROBLEMA'
  | 'DETERMINAR_CAUSA'
  | 'PLAN_ACCION'
  | 'EVALUAR_RESULTADOS'
  | 'NOTA_INCUMPLIMIENTO'
  | 'ACTA_ADMINISTRATIVA';

interface CasoUI {
  idEmpleado?: number;      // id del usuario afectado
  idUsuarioJefe?: number;   // id del jefe que creó el caso
  id: number;               // id_caso
  empleado: string;         // nombre del empleado afectado
  motivo: string;           // categoría
  levantadoPor: string;     // nombre del jefe que lo levantó
  pasoActual: number;       // 1 al 6 (estatus)
  pasoActualTexto: string;  // nombre del paso
  fecha: string | Date;
  estado: EstadoPaso;       // interno para filtros/badges
  descripcion?: string;     // descripción del caso
  impacto?: string;         // impacto del caso
  conducta?: string;        // conducta observada
  estatusCaso?: number;     // 1 = Activo, 0 = Cerrado
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavigationButtonsComponent],
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
    idUsuario: 0,
    idCategoria: 0,
    descripcion: '',
    impacto: '',
    conducta: ''
  };

  // Modal
  mostrarModal = false;
  casoSeleccionado: CasoUI | null = null;

  constructor(
    private casosService: CasosService,
    private usuariosService: UsuariosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    console.log('🚀 AdminComponent iniciado');
    this.cargarCasos();
  }

  /** Carga desde servicio y normaliza al modelo de UI */
  cargarCasos(): void {
    console.log('📂 Cargando casos del admin...');
    
    // Obtener ID del jefe del token
    const info = this.authService.getTokenInfo();
    const jefeId = info?.Id || info?.UserId;
    console.log('👤 ID del jefe:', jefeId);
    
    // Llamar al servicio con el ID del jefe
    this.casosService.obtenerCasos(Number(jefeId)).subscribe({
      next: (data: any[]) => {
        console.log('✅ Casos obtenidos del backend:', data);
        // Mapea los campos reales del backend a CasoUI:
        this.casos = data.map(item => this.mapearCaso(item));
        console.log('✅ Casos mapeados:', this.casos);
        this.actualizarConteos();
        this.aplicarFiltros();
        console.log('📊 Conteos actualizados:', this.conteos);
        
        // Cargar nombres de empleados
        this.enriquecerConNombresUsuarios();
      },
      error: (err) => {
        console.error('❌ Error al cargar casos:', err);
        alert('Error al cargar casos: ' + err.status + ' - ' + err.statusText);
      }
    });
  }

  /** Intenta obtener nombres de usuarios para enriquecer los datos */
  private enriquecerConNombresUsuarios(): void {
    const info = this.authService.getTokenInfo();
    const jefeId = info?.Id || info?.UserId;
    
    if (!jefeId) {
      console.warn('⚠️ No se encontró Id de jefe en el token');
      return;
    }

    // Obtener el nombre del jefe actual desde el token
    const nombreJefeActual = 
      (info as any)?.Nombre_Completo || 
      (info as any)?.nombreCompleto ||
      (info as any)?.Nombre || 
      (info as any)?.nombre ||
      'Admin';

    console.log('👤 Jefe actual:', { jefeId, nombreJefeActual });

    // Solo actualizamos el nombre del jefe en "Levantado por"
    // El nombre del empleado ya viene del backend
    this.casos = this.casos.map(c => ({
      ...c,
      levantadoPor: nombreJefeActual
    }));
    
    console.log('✅ Casos actualizados con nombre del jefe:', this.casos);
    this.aplicarFiltros();
  }

  /** Ajusta el caso a la forma necesaria en interfaz */
  private mapearCaso(item: any): CasoUI {
    const estatus = item.Estatus || item.estatus || 1;
    const estado = this.mapEstatusToEstado(estatus);
    const pasoActual = Number(estatus) || 1;

    // El backend devuelve snake_case, PascalCase o camelCase: cubrimos todos
    const idCaso = item.id_caso || item.IdCaso || item.idCaso || item.id;
    const idUsuario = item.id_usuario || item.IdUsuario || item.idUsuario;
    const idUsuarioJefe = item.id_usuario_jefe || item.IdUsuarioJefe || item.idUsuarioJefe;
    const categoria = item.categoria || item.Categoria || 'Sin categoría';
    const fechaRegistro = item.fecha_registro || item.FechaRegistro || item.fechaRegistro;
    const descripcion = item.descripcion || item.Descripcion || '';
    const impacto = item.impacto || item.Impacto || '';
    const conducta = item.conducta || item.Conducta || '';
    
    // Nombre del empleado afectado - ahora viene directo del backend con JOIN
    const nombreEmpleadoAfectado = 
      item.nombre_empleado || 
      item.nombreEmpleado ||
      item.NombreEmpleado ||
      `Usuario ${idUsuario ?? 'desconocido'}`;

    console.log(`🔍 Mapeando caso: id=${idCaso}, idUsuario=${idUsuario}, idUsuarioJefe=${idUsuarioJefe}, nombreEmpleado=${nombreEmpleadoAfectado}`);

    return {
      idEmpleado: idUsuario,
      idUsuarioJefe: idUsuarioJefe ? Number(idUsuarioJefe) : undefined,
      id: idCaso,
      empleado: nombreEmpleadoAfectado,
      motivo: categoria,
      levantadoPor: 'Cargando...', // Se actualizará en enriquecerConNombresUsuarios
      pasoActual,
      pasoActualTexto: this.etiquetaPaso(estado),
      fecha: fechaRegistro || new Date(),
      estado,
      descripcion,
      impacto,
      conducta,
      estatusCaso: estatus
    };
  }

  /** Mapea Estatus del API a EstadoPaso */
  private mapEstatusToEstado(estatus: string | number): EstadoPaso {
    const status = String(estatus);
    switch (status) {
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
      !this.nuevoCaso.idUsuario ||
      !this.nuevoCaso.idCategoria ||
      !this.nuevoCaso.descripcion.trim() ||
      !this.nuevoCaso.impacto.trim() ||
      !this.nuevoCaso.conducta.trim()
    ) {
      alert('Completa todos los campos');
      return;
    }

    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: () => {
        this.nuevoCaso = { idUsuario: 0, idCategoria: 0, descripcion: '', impacto: '', conducta: '' };
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

  /** Ver detalle del caso en modal */
  verCaso(caso: CasoUI): void {
    this.casoSeleccionado = caso;
    this.mostrarModal = true;
  }

  /** Cerrar modal */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.casoSeleccionado = null;
  }

  /** Editar caso */
  editarCaso(caso: CasoUI): void {
    alert(`Editar caso #${caso.id}\n\nEsta funcionalidad se implementará para permitir modificar el caso.`);
  }

  /** Exporta tabla a Excel (CSV sencillo) */
  exportarExcel(): void {
    const encabezados = ['ID','Empleado','Motivo','Levantado Por','Paso Actual','Fecha'];
    const filas = this.casosFiltrados.map(c => [
      c.id,
      c.empleado,
      c.motivo,
      c.levantadoPor,
      c.pasoActualTexto,
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
