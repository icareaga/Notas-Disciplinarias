import { Routes } from '@angular/router';

import { SenalarProblemaComponent } from './features/senalar-problema/senalar-problema.component/senalar-problema.component';
import { PlanAccionComponent } from './features/plan-accion/plan-accion.component/plan-accion.component';
import { NotaIncumplimientoComponent } from './features/nota-incumplimiento/nota-incumplimiento.component';
import { EvaluarResultadosComponent } from './features/evaluar-resultados/evaluar-resultados.component/evaluar-resultados.component';
import { DeterminarCausaComponent } from './features/determinar-causa/determinar-causa.component/determinar-causa.component';
import { ActaAdministrativaComponent } from './features/acta-administrativa/acta-administrativa.component/acta-administrativa.component';
import { UsuarioComponent } from './features/usuario//usuario/usuario.component';
import { AdminComponent } from './features/admin//admin/admin.component';

import { LoginComponent } from './features/login/login.component';

/**
 * RUTAS - Mapeo de URLs a componentes
 * 
 * Estructura del flujo:
 * - '' (raíz) → redirige a 'senalar-problema'
 * - '/login' → LoginComponent (bienvenida)
 * - '/senalar-problema' → SenalarProblemaComponent (crear notas) - PRINCIPAL
 * - '/usuario' → UsuarioComponent (ver mis notas)
 * - '/admin' → AdminComponent (panel admin)
 * - '/nota-incumplimiento' → NotaIncumplimientoComponent (detalles)
 * - ... (otras rutas en desarrollo)
 * 
 * TODO: Agregar Auth Guards para proteger rutas
 */
export const routes: Routes = [
  // Ruta por defecto: redirige a señalar-problema
  { path: '', redirectTo: 'senalar-problema', pathMatch: 'full' },
  
  // ======== RUTAS PRINCIPALES ========
  
  /** 
   * Página de bienvenida y autenticación
   * Muestra datos del usuario y botones para navegar
   */
  { path: 'login', component: LoginComponent },
  
  /**
   * Formulario principal: Crear notas disciplinarias
   * Solo accesible si eres jefe (tienes subordinados)
   * - Selecciona empleado de dropdown
   * - Selecciona categoría (tipo de incumplimiento)
   * - Escribe descripción del problema
   * - Crea la nota
   */
  { path: 'senalar-problema', component: SenalarProblemaComponent },
  
  /**
   * Panel del usuario: Ver mis notas
   * Muestra todas las notas disciplinarias creadas contra este usuario
   * Permite descargar PDFs
   */
  { path: 'usuario', component: UsuarioComponent },
  
  /**
   * Panel de administración
   * Solo visible para usuarios con rol "admin"
   * Permite gestionar: usuarios, categorías, notas globales
   */
  { path: 'admin', component: AdminComponent },
  
  // ======== RUTAS DEL FLUJO DE NOTAS (En desarrollo/futuro) ========
  
  /**
   * Paso 2: Plan de acción
   * Después de crear la nota, definir acciones correctivas
   */
  { path: 'plan-accion', component: PlanAccionComponent },
  
  /**
   * Paso 3: Nota de incumplimiento (detalles ampliados)
   * Vista detallada de la nota con más contexto
   */
  { path: 'nota-incumplimiento', component: NotaIncumplimientoComponent },
  
  /**
   * Paso 4: Evaluar resultados
   * Después de que el empleado intente corregir
   */
  { path: 'evaluar-resultados', component: EvaluarResultadosComponent },
  
  /**
   * Paso 5: Determinar causa raíz
   * Análisis del por qué ocurrió el incumplimiento
   */
  { path: 'determinar-causa', component: DeterminarCausaComponent },
  
  /**
   * Paso 6: Acta administrativa
   * Documento final si el incumplimiento es grave
   */
  { path: 'acta-administrativa', component: ActaAdministrativaComponent },
];