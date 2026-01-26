import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { filter, Subscription } from 'rxjs';
 
import { CasoCreate } from '../../../models/caso-create.model';
import { Categoria } from '../../../models/categoria.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { CasosService } from '../../../services/casos.service';
import { CategoriasService } from '../../../services/categorias.service';
import { AuthService } from '../../../services/auth.service';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';
import { NotificationsService } from '../../../shared/notifications/notifications.service';

/**
 * SENALARPROBLEMACOMPONENT - Formulario principal para crear notas disciplinarias
 * 
 * RESPONSABILIDADES:
 * 1. Cargar dinámicamente las categorías desde el backend (/api/Categorias)
 * 2. Mostrar lista de empleados subordinados del jefe autenticado
 * 3. Permitir seleccionar un empleado, categoría y describir el problema
 * 4. Enviar la nota al backend para guardarla
 */
@Component({
  selector: 'app-senalar-problema',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, NavigationButtonsComponent],
  templateUrl: './senalar-problema.component.html',
  styleUrls: ['./senalar-problema.component.scss']
})
export class SenalarProblemaComponent implements OnInit, OnDestroy {
 
  empleados: any[] = [];
  categorias: Categoria[] = [];
  misCasos: any[] = []; // Lista de casos creados por el jefe
  mostrarListaCasos = false;
  modoEdicion = false; // Si está editando un caso existente
  idCasoActual: number = 0; // ID del caso que se está editando
  private routerSubscription?: Subscription; // Para detectar cuando regresas a esta vista
  private routeSubscription?: Subscription;

  // Cierre manual (Paso 1)
  mostrarCierre = false;
  justificacionCierre = '';
  isCerrando = false;
  
  nuevoCaso: CasoCreate = {
    idUsuario: 0,
    idCategoria: 0,
    descripcion: '',
    impacto: '',
    conducta: '',
    estatus: 1,  // Por defecto 1 = Activo
    idPaso: 1    // Por defecto 1 = Primer paso (Señalar Problema)
  };

  constructor(
    private usuariosService: UsuariosService,
    private casosService: CasosService,
    private categoriasService: CategoriasService,
    private authService: AuthService,
    private router: Router,
        private route: ActivatedRoute,
        private notifications: NotificationsService
  ) {
    // Detectar cuando regresas a esta vista desde otra ruta
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Si estamos en la ruta de senalar-problema, recargar casos
      if (this.router.url.includes('/senalar-problema')) {
        const tokenInfo = this.authService.getTokenInfo();
        const idJefe = tokenInfo?.Id || tokenInfo?.UserId || (tokenInfo as any)?.['id'];
        if (idJefe) {
          this.cargarMisCasos(String(idJefe));
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  compareNumbers(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  getCategoriaId(categoria: any): number {
    return categoria.id_Categoria || categoria.Id_Categoria || categoria.idCategoria || 0;
  }

  /**
   * Obtiene el nombre del empleado por ID
   */
  getNombreEmpleado(idUsuario: number): string {
    const empleado = this.empleados.find(e => e.id === idUsuario);
    return empleado?.nombre_Completo || 'N/A';
  }

  regresarAlInicio(): void {
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
    console.log('🚀 ngOnInit iniciado');
    
    // Obtener el ID del jefe desde el token
    const tokenInfo = this.authService.getTokenInfo();
    console.log('🔐 Token Info completo:', tokenInfo);
    console.log('🔐 Propiedades del token:', tokenInfo ? Object.keys(tokenInfo) : 'sin token');
    
    // Intentar múltiples variantes de campo ID
    const idJefe = tokenInfo?.Id || 
                   tokenInfo?.UserId || 
                   (tokenInfo as any)?.['id'] || 
                   (tokenInfo as any)?.['userId'] ||
                   (tokenInfo as any)?.[Object.keys(tokenInfo || {})[0]];  // Tomar el primer valor si nada coincide
    
    if (!idJefe) {
      console.error('❌ No se encontró el ID del jefe en el token');
      return;
    }
    
    this.nuevoCaso.idUsuarioJefe = Number(idJefe);  // Guardar el jefe que crea el caso
    console.log('👤 ID del Jefe que crea el caso:', idJefe, 'tipo:', typeof idJefe);
    
    const idUsuario = String(idJefe);

    // Si llegamos desde Admin con ?idCaso=XX, cargar ese caso para edición en Paso 1.
    this.routeSubscription = this.route.queryParams.subscribe((params) => {
      const idCaso = Number(params?.['idCaso'] ?? 0);
      if (idCaso > 0) {
        this.casosService.obtenerCasoPorId(idCaso).subscribe({
          next: (caso) => this.editarCaso(caso),
          error: (err) => console.error('❌ No se pudo cargar caso para edición:', err)
        });
      }
    });
 
    this.categoriasService.obtenerCategorias().subscribe({
      next: (data: Categoria[]) => {
        this.categorias = data;
        console.log('✅ Categorías cargadas:', this.categorias.length);
        if (this.categorias.length > 0) {
          console.log('🔍 CATEGORÍAS - Primera categoría COMPLETA:', this.categorias[0]);
          console.log('🔍 CATEGORÍAS - PROPIEDADES:', Object.keys(this.categorias[0]));
          console.log('🔍 CATEGORÍAS - Primera como JSON:', JSON.stringify(this.categorias[0]));
          console.log('🔍 CATEGORÍAS - Todas las primeras 3:', this.categorias.slice(0, 3));
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar categorías:', err);
      }
    });

    this.usuariosService.obtenerJerarquia(idUsuario).subscribe({
      next: (data: any) => {
        console.log('📋 Respuesta API:', data);
        this.empleados = data.resultados ?? [];
        console.log('✅ Empleados cargados:', this.empleados.length);
        if (this.empleados.length > 0) {
          console.log('🔍 EMPLEADOS - Primer empleado:', this.empleados[0]);
          console.log('🔍 EMPLEADOS - Propiedades:', Object.keys(this.empleados[0]));
          this.empleados.forEach((e, i) => {
            console.log(`   [${i}] ${e.nombre_Completo} → id_emple_completo: ${e.id_emple_completo}, id_usuario: ${e.id_usuario}, id: ${e.id}`);
          });
        }
      },
      error: (err) => {
        console.error('❌ Error al cargar jerarquía:', err);
      }
    });

    // Cargar casos creados por este jefe
    this.cargarMisCasos(idUsuario);
  }

  /**
   * Carga los casos creados por el jefe actual
   */
  cargarMisCasos(idJefe: string): void {
    this.casosService.obtenerCasos().subscribe({
      next: (data: any[]) => {
        // Filtrar solo los casos de este jefe
        this.misCasos = data.filter(c => c.id_usuario_jefe === Number(idJefe));
        console.log('📋 Mis casos cargados:', this.misCasos.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar casos:', err);
      }
    });
  }

  /**
   * Recarga manualmente la lista de casos
   * Útil cuando regresas de editar un paso
   */
  recargarCasos(): void {
    const tokenInfo = this.authService.getTokenInfo();
    const idJefe = tokenInfo?.Id || tokenInfo?.UserId || (tokenInfo as any)?.['id'];
    if (idJefe) {
      console.log('🔄 Recargando casos...');
      this.cargarMisCasos(String(idJefe));
    }
  }

  toggleListaCasos(): void {
    this.mostrarListaCasos = !this.mostrarListaCasos;
  }

  /**
   * Selecciona un caso para editar o avanzar al siguiente paso
   */
  seleccionarCaso(caso: any): void {
    const idPaso = caso.id_paso || 1;
    const nombreEmpleado = this.getNombreEmpleado(caso.id_usuario);
    
    // Determinar el siguiente paso
    const pasoSiguiente = idPaso + 1;
    const nombresPasos: { [key: number]: string } = {
      1: 'Señalar Problema',
      2: 'Determinar Causa',
      3: 'Plan de Acción',
      4: 'Evaluar Resultados',
      5: 'Nota de Incumplimiento',
      6: 'Acta Administrativa'
    };

    const mensaje = idPaso < 6 
      ? `Caso #${caso.id_caso} - ${nombreEmpleado}\n\nPaso actual: ${nombresPasos[idPaso]}\n\n¿Deseas avanzar al siguiente paso?\n(${nombresPasos[pasoSiguiente]})`
      : `Caso #${caso.id_caso} - ${nombreEmpleado}\n\nEl caso está en el último paso.\n\n¿Deseas editarlo?`;

    if (confirm(mensaje)) {
      if (idPaso < 6) {
        // Navegar al siguiente paso
        this.navegarAPaso(caso.id_caso, pasoSiguiente);
      } else {
        // Editar el último paso
        this.navegarAPaso(caso.id_caso, idPaso);
      }
    } else {
      // Usuario canceló, preguntar si quiere editar el paso actual
      if (confirm(`¿Deseas editar el paso actual (${nombresPasos[idPaso]})?`)) {
        if (idPaso === 1) {
          // Si es paso 1, editar en esta misma vista
          this.editarCaso(caso);
        } else {
          // Para otros pasos, navegar a su componente
          this.navegarAPaso(caso.id_caso, idPaso);
        }
      }
    }
  }

  /**
   * Navega al paso correspondiente según el id_paso
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

  /**
   * Edita el caso actual (Paso 1)
   */
  editarCaso(caso: any): void {
    const idCaso = Number(caso?.id_caso ?? caso?.IdCaso ?? caso?.idCaso ?? caso?.id ?? 0);
    if (!idCaso) {
      console.error('❌ editarCaso(): no se encontró id del caso', caso);
      return;
    }

    this.modoEdicion = true;
    this.idCasoActual = idCaso;
    this.mostrarListaCasos = false;
    this.mostrarCierre = false;
    this.justificacionCierre = '';
    
    // Cargar datos en el formulario
    this.nuevoCaso = {
      idUsuario: Number(caso?.id_usuario ?? caso?.IdUsuario ?? caso?.idUsuario ?? 0),
      idCategoria: Number(caso?.id_categoria ?? caso?.IdCategoria ?? caso?.idCategoria ?? 0),
      descripcion: String(caso?.descripcion ?? caso?.Descripcion ?? ''),
      impacto: String(caso?.impacto ?? caso?.Impacto ?? ''),
      conducta: String(caso?.conducta ?? caso?.Conducta ?? ''),
      idUsuarioJefe: Number(caso?.id_usuario_jefe ?? caso?.IdUsuarioJefe ?? caso?.idUsuarioJefe ?? this.nuevoCaso.idUsuarioJefe ?? 0) || 0,
      estatus: Number(caso?.estatus ?? caso?.Estatus ?? 1),
      idPaso: Number(caso?.id_paso ?? caso?.IdPaso ?? caso?.idPaso ?? 1) || 1
    };

    console.log('📝 Editando caso:', this.idCasoActual);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Cancela la edición y limpia el formulario
   */
  cancelarEdicion(): void {
    this.modoEdicion = false;
    this.idCasoActual = 0;
    this.mostrarCierre = false;
    this.justificacionCierre = '';
    this.nuevoCaso = {
      idUsuario: 0,
      idCategoria: 0,
      descripcion: '',
      impacto: '',
      conducta: '',
      idUsuarioJefe: this.nuevoCaso.idUsuarioJefe,
      estatus: 1,
      idPaso: 1
    };
  }

  cancelarCierre(): void {
    this.mostrarCierre = false;
    this.justificacionCierre = '';
  }

  cerrarCasoActual(): void {
    if (!this.modoEdicion || !this.idCasoActual) {
      return;
    }

    const justificacion = (this.justificacionCierre ?? '').trim();
    if (!justificacion) {
      this.notifications.warning('Escribe una justificación para cerrar el caso');
      return;
    }

    if (!confirm('¿Deseas cerrar este caso? Esta acción marcará el caso como cerrado (estatus=0).')) {
      return;
    }

    const tokenInfo = this.authService.getTokenInfo();
    const idUsuarioCierre =
      Number(tokenInfo?.Id || tokenInfo?.UserId || (tokenInfo as any)?.['id'] || (tokenInfo as any)?.['userId'] || 0) || null;
    const idJefe = String(tokenInfo?.Id || tokenInfo?.UserId || (tokenInfo as any)?.['id'] || '');

    this.isCerrando = true;
    this.casosService
      .cerrarCaso(this.idCasoActual, { justificacion_cierre: justificacion, id_usuario_cierre: idUsuarioCierre })
      .subscribe({
        next: () => {
          this.isCerrando = false;
          this.notifications.success('✅ Caso cerrado correctamente');
          this.cancelarEdicion();
          if (idJefe) {
            this.cargarMisCasos(idJefe);
          }
        },
        error: (err) => {
          this.isCerrando = false;
          console.error('❌ Error al cerrar caso:', err);
          const details =
            (typeof err?.error === 'string'
              ? err.error
              : (err?.error?.message ?? err?.error?.title ?? err?.statusText ?? '')) || 'Error desconocido';
          this.notifications.error(`No se pudo cerrar el caso. ${details}`);
        }
      });
  }

  cerrarCasoDesdeLista(caso: any): void {
    const idCaso = Number(caso?.id_caso ?? caso?.IdCaso ?? caso?.idCaso ?? 0);
    if (!idCaso) return;

    const justificacion = (prompt('Justificación de cierre del caso:') ?? '').trim();
    if (!justificacion) return;

    const tokenInfo = this.authService.getTokenInfo();
    const idUsuarioCierre =
      Number(tokenInfo?.Id || tokenInfo?.UserId || (tokenInfo as any)?.['id'] || (tokenInfo as any)?.['userId'] || 0) || null;
    const idJefe = String(tokenInfo?.Id || tokenInfo?.UserId || (tokenInfo as any)?.['id'] || '');

    this.isCerrando = true;
    this.casosService
      .cerrarCaso(idCaso, { justificacion_cierre: justificacion, id_usuario_cierre: idUsuarioCierre })
      .subscribe({
        next: () => {
          this.isCerrando = false;
          this.notifications.success('✅ Caso cerrado correctamente');
          if (idJefe) {
            this.cargarMisCasos(idJefe);
          }
        },
        error: (err) => {
          this.isCerrando = false;
          console.error('❌ Error al cerrar caso:', err);
          this.notifications.error('No se pudo cerrar el caso');
        }
      });
  }

  /**
   * MÉTODO PRINCIPAL: Crea una nueva nota disciplinaria
   * 
   * Este método se ejecuta cuando el jefe presiona el botón "Guardar".
   * Realiza validaciones exhaustivas antes de enviar al backend.
   * 
   * PROCESO COMPLETO:
   * 1. VALIDACIÓN DE CAMPOS OBLIGATORIOS:
   *    - idUsuario (empleado seleccionado)
   *    - idCategoria (tipo de falta)
   *    - descripcion (qué pasó)
   *    - impacto (consecuencias)
   *    - conducta (comportamiento observado)
   * 
   * 2. VALIDACIÓN DE INTEGRIDAD:
   *    - Verifica que la categoría existe en el catálogo
   *    - Evita IDs inválidos o inexistentes
   * 
   * 3. PREPARACIÓN DE DATOS:
   *    - Fuerza idPaso = 1 (siempre inicia en paso 1 de 6)
   *    - Agrega idUsuarioJefe automáticamente
   *    - Convierte formato camelCase a snake_case para API .NET
   * 
   * 4. ENVÍO AL BACKEND:
   *    - POST /api/Casos/crear
   *    - Espera confirmación del servidor
   * 
   * 5. MANEJO DE RESPUESTA:
   *    - Éxito: Muestra alerta, resetea formulario
   *    - Error: Muestra mensaje detallado del error
   * 
   * VALIDACIONES IMPLEMENTADAS:
   * - Campos no vacíos (trim())
   * - Categoría existe en el array categorias[]
   * - IDs son números válidos
   * 
   * LOGS PARA DEBUGGING:
   * - Estado de cada campo antes de validar
   * - Caso completo antes de enviar
   * - Respuesta del servidor (éxito o error)
   */
  crearCaso(): void {
    console.log('🔍 ANTES DE VALIDAR:');
    console.log('  idUsuario:', this.nuevoCaso.idUsuario, typeof this.nuevoCaso.idUsuario);
    console.log('  idCategoria:', this.nuevoCaso.idCategoria, typeof this.nuevoCaso.idCategoria);
    console.log('  idUsuarioJefe:', this.nuevoCaso.idUsuarioJefe, typeof this.nuevoCaso.idUsuarioJefe);
    console.log('  descripcion:', this.nuevoCaso.descripcion?.trim(), 'vacía?', !this.nuevoCaso.descripcion?.trim());
    console.log('  impacto:', this.nuevoCaso.impacto?.trim(), 'vacía?', !this.nuevoCaso.impacto?.trim());
    console.log('  conducta:', this.nuevoCaso.conducta?.trim(), 'vacía?', !this.nuevoCaso.conducta?.trim());

    if (!this.nuevoCaso.idUsuario || !this.nuevoCaso.idCategoria || !this.nuevoCaso.descripcion?.trim() || 
        !this.nuevoCaso.impacto?.trim() || !this.nuevoCaso.conducta?.trim()) {
      this.notifications.warning('Completa todos los campos obligatorios');
      return;
    }

    // Verificar que la categoría existe
    const categoriaExiste = this.categorias.find(c => {
      const id = c.id_Categoria || (c as any).Id_Categoria || (c as any).idCategoria;
      return id === this.nuevoCaso.idCategoria;
    });
    
    if (!categoriaExiste) {
      this.notifications.error(`Error: La categoría con ID ${this.nuevoCaso.idCategoria} no existe. Selecciona una categoría válida.`);
      console.error('❌ Categoría no encontrada. Buscando ID:', this.nuevoCaso.idCategoria);
      console.error('❌ Categorías disponibles:', this.categorias);
      return;
    }

    // IMPORTANTE: Guardar Paso 1 NO debe avanzar automáticamente a Paso 2.
    // - Caso nuevo: se queda en Paso 1.
    // - Caso en edición: preserva el paso actual (no lo regresa).
    const idPasoActual = Number(this.nuevoCaso.idPaso ?? 1) || 1;
    this.nuevoCaso.idPaso = this.modoEdicion ? idPasoActual : 1;
    
    console.log('📤 ENVIANDO CASO COMPLETO:', this.nuevoCaso);
    console.log('✅ Categoría verificada:', categoriaExiste.nombre);
    console.log('✅ idPaso calculado (no auto-avanza):', this.nuevoCaso.idPaso);

    const tokenInfo = this.authService.getTokenInfo();
    const idJefe = String(tokenInfo?.Id || tokenInfo?.UserId);

    if (this.modoEdicion && this.idCasoActual > 0) {
      this.casosService.actualizarCasoPaso1(this.idCasoActual, this.nuevoCaso).subscribe({
        next: (respuesta: any) => {
          console.log('✅ Caso actualizado:', respuesta);
          this.notifications.success('Caso actualizado correctamente');

          // Salir de edición y recargar lista
          this.cancelarEdicion();
          this.cargarMisCasos(idJefe);
        },
        error: (err) => {
          console.error('❌ Error al actualizar caso:', err);
          this.notifications.error(`Error al actualizar el caso: ${err.error?.message || err.statusText || 'Error desconocido'}`);
        }
      });
      return;
    }

    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: (respuesta: any) => {
        console.log('✅ Caso creado:', respuesta);
        this.notifications.success('Caso creado correctamente');

        this.cargarMisCasos(idJefe);

        // Limpiar formulario
        this.nuevoCaso = {
          idUsuario: 0,
          idCategoria: 0,
          descripcion: '',
          impacto: '',
          conducta: '',
          idUsuarioJefe: this.nuevoCaso.idUsuarioJefe,
          estatus: 1,
          idPaso: 1
        };
      },
      error: (err) => {
        console.error('❌ Error:', err);
        console.error('Status:', err.status);
        console.error('Error detalle:', err.error);
        this.notifications.error(`Error al crear el caso: ${err.error?.message || err.statusText || 'Error desconocido'}`);
      }
    });
  }
}
