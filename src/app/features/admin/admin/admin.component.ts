
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CasoCreate } from '../../../models/caso-create.model';
import { CasosService } from '../../../services/casos.service';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { DeterminarCausaService } from '../../../services/determinar-causa.service';
import { PlanAccionService } from '../../../services/plan-accion.service';
import { EvaluarResultadosService } from '../../../services/evaluar-resultados.service';
import { NotaIncumplimientoService } from '../../../services/nota-incumplimiento.service';
import { ActaAdministrativaService } from '../../../services/acta-administrativa.service';
import { ActaAdministrativaResponse } from '../../../models/acta-administrativa.model';
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
  imports: [CommonModule, NgIf, NgFor, FormsModule, NavigationButtonsComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {
  pasosDelCaso?: any[];

  paso2Estado: 'idle' | 'loading' | 'ok' | 'empty' | 'error' = 'idle';
  paso2Error?: { status?: number; message?: string; details?: string };

  paso3Estado: 'idle' | 'loading' | 'ok' | 'empty' | 'error' = 'idle';
  paso3Error?: { status?: number; message?: string; details?: string };

  paso4Estado: 'idle' | 'loading' | 'ok' | 'empty' | 'error' = 'idle';
  paso4Error?: { status?: number; message?: string; details?: string };

  paso5Estado: 'idle' | 'loading' | 'ok' | 'empty' | 'error' = 'idle';
  paso5Error?: { status?: number; message?: string; details?: string };

  paso6Estado: 'idle' | 'loading' | 'ok' | 'empty' | 'error' = 'idle';
  paso6Error?: { status?: number; message?: string; details?: string };
  

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
  datosPaso2: any = null; // Datos del Paso 2 si existen
  datosPaso3: any = null; // Datos del Paso 3 si existen
  datosPaso4: any = null; // Datos del Paso 4 si existen
  datosPaso5: any = null; // Datos del Paso 5 si existen
  datosPaso6: ActaAdministrativaResponse | null = null; // Datos del Paso 6 si existen

  // Modal de edición (reemplaza confirm())
  mostrarModalEditar = false;
  casoParaEditar: CasoUI | null = null;
  pasoActualNombre = '';
  pasoSiguienteNombre = '';
  pasoSiguienteNumero = 0;

  private avanzandoPaso = false;

  constructor(
    private casosService: CasosService,
    private usuariosService: UsuariosService,
    private authService: AuthService,
    private router: Router,
    private determinarCausaService: DeterminarCausaService,
    private planAccionService: PlanAccionService,
    private evaluarResultadosService: EvaluarResultadosService,
    private notaIncumplimientoService: NotaIncumplimientoService,
    private actaAdministrativaService: ActaAdministrativaService
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
        console.log('📊 TOTAL DE CASOS:', data.length);
        
        // 🔍 LOGGING DETALLADO - Ver TODOS los campos del primer caso
        if (data.length > 0) {
          console.log('🔍 PRIMER CASO - Campos disponibles:', Object.keys(data[0]));
          console.log('🔍 PRIMER CASO - Objeto completo:', JSON.stringify(data[0], null, 2));
        }
        
        // 🔍 TEMPORAL: Mostrar el caso 75 completo
        const caso75 = data.find(c => c.id_caso === 75 || c.idCaso === 75 || c.id === 75);
        if (caso75) {
          console.log('🔍🔍🔍 CASO 75 RAW DEL BACKEND:');
          console.log('   📋 Campos disponibles:', Object.keys(caso75));
          console.log('   📦 Objeto completo:', JSON.stringify(caso75, null, 2));
          console.log('   📌 id_paso:', caso75.id_paso);
          console.log('   📌 IdPaso:', caso75.IdPaso);
          console.log('   📌 idPaso:', caso75.idPaso);
        } else {
          console.log('⚠️ No se encontró el caso 75 en la respuesta');
        }
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

  /**
   * Recarga manualmente la lista de casos
   * Útil cuando regresas de editar un caso y necesitas ver los cambios
   */
  recargarCasos(): void {
    console.log('🔄 Recargando casos...');
    const info = this.authService.getTokenInfo();
    const jefeId = info?.Id || info?.UserId;
    
    if (!jefeId) {
      console.error('❌ No se pudo obtener el ID del jefe');
      return;
    }

    this.casosService.obtenerCasos(Number(jefeId)).subscribe({
      next: (data: any[]) => {
        this.casos = data.map(item => this.mapearCaso(item));
        this.actualizarConteos();
        this.aplicarFiltros();
        this.enriquecerConNombresUsuarios();
        console.log('✅ Casos recargados correctamente');
      },
      error: (err) => {
        console.error('❌ Error al recargar casos:', err);
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
    // Obtener id_paso del backend (1, 2, 3, 4, 5, 6) y forzar a número
    const idPaso = Number(item.id_paso ?? item.IdPaso ?? item.idPaso ?? 1);
    const estado = this.mapIdPasoToEstado(idPaso);
    const pasoActual = idPaso || 1;

    // 🔍 LOGGING DETALLADO para caso 75
    const idCasoTemp = item.id_caso || item.IdCaso || item.idCaso || item.id;
    if (idCasoTemp === 75) {
      console.log('🔍🔍🔍 CASO 75 DETALLADO:');
      console.log('   📦 Item completo del backend:', JSON.stringify(item, null, 2));
      console.log('   📌 item.id_paso:', item.id_paso);
      console.log('   📌 item.IdPaso:', item.IdPaso);
      console.log('   📌 item.idPaso:', item.idPaso);
      console.log('   ➡️ idPaso calculado:', idPaso);
      console.log('   ➡️ estado:', estado);
      console.log('   ➡️ pasoActual:', pasoActual);
    }

    console.log(`📊 Mapeando caso ${item.id_caso || item.id}: id_paso=${idPaso}, estado=${estado}, pasoActual=${pasoActual}`);

    // El backend devuelve snake_case, PascalCase o camelCase: cubrimos todos
    const idCaso = item.id_caso || item.IdCaso || item.idCaso || item.id;
    const idUsuario = item.id_usuario || item.IdUsuario || item.idUsuario;
    const idUsuarioJefe = item.id_usuario_jefe || item.IdUsuarioJefe || item.idUsuarioJefe;
    const categoria = item.categoria || item.Categoria || 'Sin categoría';
    const fechaRegistro = item.fecha_registro || item.FechaRegistro || item.fechaRegistro;
    const descripcion = item.descripcion || item.Descripcion || '';
    const impacto = item.impacto || item.Impacto || '';
    const conducta = item.conducta || item.Conducta || '';
    // OJO: estatus puede ser 0 (Cerrado). No usar || porque 0 es falsy.
    const estatus = (item.estatus ?? item.Estatus ?? 1);
    
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

  /** Mapea id_paso (1-6) a EstadoPaso */
  private mapIdPasoToEstado(idPaso: string | number): EstadoPaso {
    const paso = Number(idPaso);
    switch (paso) {
      case 1: return 'SENALAR_PROBLEMA';
      case 2: return 'DETERMINAR_CAUSA';
      case 3: return 'PLAN_ACCION';
      case 4: return 'EVALUAR_RESULTADOS';
      case 5: return 'NOTA_INCUMPLIMIENTO';
      case 6: return 'ACTA_ADMINISTRATIVA';
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

  /** Devuelve el nombre del paso por número (1-6) */
  nombrePasoPorNumero(num: number): string {
    switch (Number(num)) {
      case 1: return 'Senalar Problema';
      case 2: return 'Determinar Causa';
      case 3: return 'Plan de Acción';
      case 4: return 'Evaluar Resultados';
      case 5: return 'Nota de Incumplimiento';
      case 6: return 'Acta Administrativa';
      default: return '—';
    }
  }

  /** Obtiene el paso normalizado por número del arreglo pasosDelCaso */
  getPaso(num: number): any | null {
    const lista = this.pasosDelCaso || [];
    const paso = lista.find(p => Number(p?.idPaso) === Number(num));
    return paso || null;
  }

  /** Indica si el número de paso es el actual del caso seleccionado */
  esPasoActual(num: number): boolean {
    return !!this.casoSeleccionado && Number(this.casoSeleccionado.pasoActual) === Number(num);
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

    console.log('📊 Conteos actualizados:', this.conteos);
    console.log('📋 Estados de casos:', this.casos.map(c => ({ id: c.id, estado: c.estado, paso: c.pasoActual })));
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
    this.datosPaso2 = null; // Resetear datos previos
    this.datosPaso3 = null;
    this.datosPaso4 = null;
    this.datosPaso5 = null;
    this.datosPaso6 = null;
    this.pasosDelCaso = undefined;
    this.paso2Estado = 'idle';
    this.paso2Error = undefined;
    this.paso3Estado = 'idle';
    this.paso3Error = undefined;
    this.paso4Estado = 'idle';
    this.paso4Error = undefined;
    this.paso5Estado = 'idle';
    this.paso5Error = undefined;
    this.paso6Estado = 'idle';
    this.paso6Error = undefined;

    console.log('🔍 Abriendo modal para caso:', caso.id);

    // Intentar cargar historial de pasos, pero si falla no afecta la vista
    this.casosService.obtenerPasosPorCaso(caso.id).subscribe({
      next: (pasos: any[]) => {
        if (Array.isArray(pasos) && pasos.length > 0) {
          // Normalizar estructura de pasos para evitar inconsistencias de propiedades
          this.pasosDelCaso = pasos.map((p) => {
            const numero = Number(p?.idPaso ?? p?.id_paso ?? 1);
            return {
              // preservar campos específicos del backend (ej. causas_identificadas del Paso 2)
              ...(p ?? {}),
              idPaso: numero,
              nombrePaso: p?.nombrePaso ?? p?.nombre_paso ?? this.nombrePasoPorNumero(numero),
              // Campos base
              descripcion: p?.descripcion ?? caso.descripcion,
              impacto: p?.impacto ?? caso.impacto,
              conducta: p?.conducta ?? caso.conducta,
              fechaRegistro: p?.fechaRegistro ?? p?.fecha_registro ?? caso.fecha,
              Evidencias: p?.Evidencias ?? []
            };
          });
        } else {
          // Fallback: construir Paso 1 desde los datos del caso
          this.pasosDelCaso = [
            {
              idPaso: 1,
              nombrePaso: 'Señalar Problema',
              descripcion: caso.descripcion,
              impacto: caso.impacto,
              conducta: caso.conducta,
              fechaRegistro: caso.fecha,
              Evidencias: []
            }
          ];
        }
        console.log('✅ Pasos del caso (con fallback si aplica):', this.pasosDelCaso);
      },
      error: (err) => {
        // Fallback en error: mostrar Paso 1 construido desde casoSeleccionado
        this.pasosDelCaso = [
          {
            idPaso: 1,
            nombrePaso: 'Señalar Problema',
            descripcion: caso.descripcion,
            impacto: caso.impacto,
            conducta: caso.conducta,
            fechaRegistro: caso.fecha,
            Evidencias: []
          }
        ];
        console.log('ℹ️ No se pudieron cargar los pasos del caso, usando fallback Paso 1');
        console.log('   Error:', err);
      }
    });

    // SIEMPRE intentar cargar datos del Paso 2, sin importar en qué paso esté
    // Si hay datos, se mostrarán; si no, simplemente no aparecerá la sección
    this.paso2Estado = 'loading';
    this.determinarCausaService.obtenerPorCaso(caso.id).subscribe({
      next: (datos) => {
        this.datosPaso2 = datos;
        this.paso2Estado = (datos && (datos as any).id_paso2) ? 'ok' : 'empty';
        this.paso2Error = undefined;
        console.log('✅ Datos del Paso 2 cargados:');
        console.log('   - Causas:', datos.causas_identificadas);
        console.log('   - Comentarios:', datos.comentarios_adicionales);
        console.log('   - Evidencias:', datos.Evidencias);
        console.log('   - Objeto completo:', datos);
      },
      error: (err) => {
        const status = err?.status;
        const backendBody = err?.error;
        const details =
          (typeof backendBody === 'string'
            ? backendBody
            : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
          undefined;
        const inner = (typeof backendBody === 'object' && backendBody?.inner) ? String(backendBody.inner) : undefined;

        this.paso2Error = {
          status,
          message: err?.message,
          details: inner ? `${details ?? ''}${details ? ' | ' : ''}${inner}` : details
        };
        // 404 normalmente significa que no existe registro, 500 es error real
        this.paso2Estado = status === 404 ? 'empty' : 'error';

        if (status === 404) {
          console.log('ℹ️ No hay datos del Paso 2 para este caso (es normal si no se ha completado)');
          console.log('   Error:', err);
        } else {
          console.error('❌ Error real al obtener Paso 2:', err);
        }
      }
    });

    // SIEMPRE intentar cargar datos del Paso 3 (Plan de Acción)
    this.paso3Estado = 'loading';
    this.planAccionService.obtenerPorCaso(caso.id).subscribe({
      next: (datos) => {
        this.datosPaso3 = datos;
        this.paso3Estado = (datos && (datos as any).id_paso3) ? 'ok' : 'empty';
        this.paso3Error = undefined;
        console.log('✅ Datos del Paso 3 cargados:', datos);
      },
      error: (err) => {
        const status = err?.status;
        const backendBody = err?.error;
        const details =
          (typeof backendBody === 'string'
            ? backendBody
            : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
          undefined;

        this.paso3Error = {
          status,
          message: err?.message,
          details
        };
        this.paso3Estado = status === 404 ? 'empty' : 'error';
      }
    });

    // SIEMPRE intentar cargar datos del Paso 4 (Evaluar Resultados)
    this.paso4Estado = 'loading';
    this.evaluarResultadosService.obtenerPorCaso(caso.id).subscribe({
      next: (datos) => {
        this.datosPaso4 = datos;
        this.paso4Estado = (datos && (datos as any).id_paso4) ? 'ok' : 'empty';
        this.paso4Error = undefined;
        console.log('✅ Datos del Paso 4 cargados:', datos);
      },
      error: (err) => {
        const status = err?.status;
        const backendBody = err?.error;
        const details =
          (typeof backendBody === 'string'
            ? backendBody
            : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
          undefined;

        this.paso4Error = {
          status,
          message: err?.message,
          details
        };
        this.paso4Estado = status === 404 ? 'empty' : 'error';
      }
    });

    // SIEMPRE intentar cargar datos del Paso 5 (Nota de Incumplimiento)
    this.paso5Estado = 'loading';
    this.notaIncumplimientoService.obtenerPorCaso(caso.id).subscribe({
      next: (datos) => {
        this.datosPaso5 = datos;
        this.paso5Estado = (datos && (datos as any).id_paso5) ? 'ok' : 'empty';
        this.paso5Error = undefined;
        console.log('✅ Datos del Paso 5 cargados:', datos);
      },
      error: (err) => {
        const status = err?.status;
        const backendBody = err?.error;
        const details =
          (typeof backendBody === 'string'
            ? backendBody
            : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
          undefined;

        this.paso5Error = {
          status,
          message: err?.message,
          details
        };
        this.paso5Estado = status === 404 ? 'empty' : 'error';
      }
    });

    // SIEMPRE intentar cargar datos del Paso 6 (Acta Administrativa)
    this.paso6Estado = 'loading';
    this.actaAdministrativaService.obtenerPorCaso(caso.id).subscribe({
      next: (datos) => {
        this.datosPaso6 = datos;
        this.paso6Estado = (datos && (datos as any).id_paso6) ? 'ok' : 'empty';
        this.paso6Error = undefined;
        console.log('✅ Datos del Paso 6 cargados:', datos);
      },
      error: (err) => {
        const status = err?.status;
        const backendBody = err?.error;
        const details =
          (typeof backendBody === 'string'
            ? backendBody
            : (backendBody?.error ?? backendBody?.message ?? backendBody?.title)) ??
          undefined;

        this.paso6Error = {
          status,
          message: err?.message,
          details
        };
        this.paso6Estado = status === 404 ? 'empty' : 'error';
      }
    });
  }

  /** Indica si Paso 2 tiene datos desde endpoint o desde pasosDelCaso */
  paso2TieneDatos(): boolean {
    const p2 = this.getPaso(2);
    return !!(
      (this.datosPaso2 && (this.datosPaso2 as any).causas_identificadas) ||
      (p2 && (p2 as any).causas_identificadas)
    );
  }

  paso3TieneDatos(): boolean {
    const p3 = this.getPaso(3);
    return !!(
      (this.datosPaso3 && ((this.datosPaso3 as any).metas_claras || (this.datosPaso3 as any).capacitacion_sesion)) ||
      (p3 && ((p3 as any).metas_claras || (p3 as any).capacitacion_sesion))
    );
  }

  paso4TieneDatos(): boolean {
    const p4 = this.getPaso(4);
    return !!(
      (this.datosPaso4 && ((this.datosPaso4 as any).sesion_privada || (this.datosPaso4 as any).comparacion)) ||
      (p4 && ((p4 as any).sesion_privada || (p4 as any).comparacion))
    );
  }

  paso5TieneDatos(): boolean {
    const p5 = this.getPaso(5);
    return !!(
      (this.datosPaso5 && ((this.datosPaso5 as any).comportamiento || (this.datosPaso5 as any).observaciones)) ||
      (p5 && ((p5 as any).comportamiento || (p5 as any).observaciones))
    );
  }

  paso6TieneDatos(): boolean {
    const p6 = this.getPaso(6);
    return !!(
      (this.datosPaso6 && ((this.datosPaso6 as any).colaborador || (this.datosPaso6 as any).historial)) ||
      (p6 && ((p6 as any).colaborador || (p6 as any).historial))
    );
  }

  /** Cerrar modal */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.casoSeleccionado = null;
    this.datosPaso2 = null;
    this.datosPaso3 = null;
    this.datosPaso4 = null;
    this.datosPaso5 = null;
    this.datosPaso6 = null;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.casoParaEditar = null;
    this.pasoActualNombre = '';
    this.pasoSiguienteNombre = '';
    this.pasoSiguienteNumero = 0;
  }

  /** Formatea el tamaño del archivo en KB/MB */
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  

  /** Editar caso - Navega al paso correspondiente */
  editarCaso(caso: CasoUI): void {
    if (caso?.estatusCaso !== 1) {
      alert('Este caso está cerrado. No se puede editar.');
      return;
    }
    const nombresPasos: { [key: number]: string } = {
      1: 'Señalar Problema',
      2: 'Determinar Causa',
      3: 'Plan de Acción',
      4: 'Evaluar Resultados',
      5: 'Nota de Incumplimiento',
      6: 'Acta Administrativa'
    };

    this.casoParaEditar = caso;
    this.pasoActualNombre = nombresPasos[caso.pasoActual] ?? `Paso ${caso.pasoActual}`;
    this.pasoSiguienteNumero = caso.pasoActual < 6 ? caso.pasoActual + 1 : 6;
    this.pasoSiguienteNombre = nombresPasos[this.pasoSiguienteNumero] ?? `Paso ${this.pasoSiguienteNumero}`;

    // Si venimos desde el modal de detalle, lo cerramos para no apilar overlays
    if (this.mostrarModal) {
      this.mostrarModal = false;
    }

    this.mostrarModalEditar = true;
  }

  irAPasoDesdeModalEditar(tipo: 'actual' | 'siguiente'): void {
    if (!this.casoParaEditar) return;

    const caso = this.casoParaEditar;

    if (caso?.estatusCaso !== 1) {
      alert('Este caso está cerrado. No se puede editar ni avanzar pasos.');
      return;
    }

    // Si el usuario quiere ir al siguiente paso, completamos el paso actual
    // para que Casos.id_paso se actualice en BD y Admin quede sincronizado.
    if (tipo === 'siguiente' && caso.pasoActual < 6) {
      this.completarPasoYAvanzar(caso);
      return;
    }

    const paso = tipo === 'siguiente'
      ? (caso.pasoActual < 6 ? caso.pasoActual + 1 : caso.pasoActual)
      : caso.pasoActual;

    this.cerrarModalEditar();
    this.navegarAPaso(caso.id, paso);
  }

  private completarPasoYAvanzar(caso: CasoUI): void {
    if (this.avanzandoPaso) return;

    if (caso?.estatusCaso !== 1) {
      alert('Este caso está cerrado. No se puede avanzar.');
      return;
    }

    this.avanzandoPaso = true;

    const finalizar = (pasoDestino: number) => {
      this.avanzandoPaso = false;
      this.cerrarModalEditar();
      this.navegarAPaso(caso.id, pasoDestino);
      // refresca la lista para que se vea el id_paso actualizado
      this.recargarCasos();
    };

    const fallar = (mensaje: string, pasoFallback: number) => {
      this.avanzandoPaso = false;
      alert(mensaje);
      this.cerrarModalEditar();
      this.navegarAPaso(caso.id, pasoFallback);
    };

    switch (caso.pasoActual) {
      case 2: {
        this.determinarCausaService.obtenerPorCaso(caso.id).subscribe({
          next: (p2: any) => {
            const idPaso2 = Number(p2?.id_paso2 ?? 0);
            if (!idPaso2) {
              fallar('No se encontró el registro del Paso 2 para completar. Abre el Paso 2 y guarda primero.', 2);
              return;
            }
            this.determinarCausaService.completarPaso2(idPaso2).subscribe({
              next: () => finalizar(3),
              error: () => fallar('No se pudo completar el Paso 2.', 2)
            });
          },
          error: () => fallar('No hay datos del Paso 2. Abre el Paso 2 y guarda primero.', 2)
        });
        return;
      }

      case 3: {
        this.planAccionService.obtenerPorCaso(caso.id).subscribe({
          next: (p3: any) => {
            const idPaso3 = Number(p3?.id_paso3 ?? 0);
            if (!idPaso3) {
              fallar('No se encontró el registro del Paso 3 para completar. Abre el Paso 3 y guarda primero.', 3);
              return;
            }
            this.planAccionService.completarPaso3(idPaso3).subscribe({
              next: () => finalizar(4),
              error: () => fallar('No se pudo completar el Paso 3.', 3)
            });
          },
          error: () => fallar('No hay datos del Paso 3. Abre el Paso 3 y guarda primero.', 3)
        });
        return;
      }

      case 4: {
        this.evaluarResultadosService.obtenerPorCaso(caso.id).subscribe({
          next: (p4: any) => {
            const idPaso4 = Number(p4?.id_paso4 ?? 0);
            if (!idPaso4) {
              fallar('No se encontró el registro del Paso 4 para completar. Abre el Paso 4 y guarda primero.', 4);
              return;
            }
            this.evaluarResultadosService.completarPaso4(idPaso4).subscribe({
              next: () => finalizar(5),
              error: () => fallar('No se pudo completar el Paso 4.', 4)
            });
          },
          error: () => fallar('No hay datos del Paso 4. Abre el Paso 4 y guarda primero.', 4)
        });
        return;
      }

      case 5: {
        this.notaIncumplimientoService.obtenerPorCaso(caso.id).subscribe({
          next: (p5: any) => {
            const idPaso5 = Number(p5?.id_paso5 ?? 0);
            if (!idPaso5) {
              fallar('No se encontró el registro del Paso 5 para completar. Abre el Paso 5 y guarda primero.', 5);
              return;
            }
            this.notaIncumplimientoService.completarPaso5(idPaso5).subscribe({
              next: () => finalizar(6),
              error: () => fallar('No se pudo completar el Paso 5.', 5)
            });
          },
          error: () => fallar('No hay datos del Paso 5. Abre el Paso 5 y guarda primero.', 5)
        });
        return;
      }

      default:
        this.avanzandoPaso = false;
        // Paso 1: solo navega; el paso se actualiza al guardar desde pantalla.
        finalizar(Math.min(caso.pasoActual + 1, 6));
        return;
    }
  }

  /**
   * Navega al paso correspondiente con el ID del caso
   */
  navegarAPaso(idCaso: number, paso: number): void {
    const rutas: { [key: number]: string } = {
      1: '/senalar-problema',
      2: '/determinar-causa',
      3: '/plan-accion',
      4: '/evaluar-resultados',
      5: '/nota-incumplimiento',
      6: '/acta-administrativa'
    };

    const ruta = rutas[paso] || '/senalar-problema';
    this.router.navigate([ruta], { queryParams: { idCaso } });
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
