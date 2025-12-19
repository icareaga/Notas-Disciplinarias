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



export const routes: Routes = [
  { path: '', redirectTo: 'senalar-problema', pathMatch: 'full' },
  { path: 'senalar-problema', component: SenalarProblemaComponent },


  
  { path: 'plan-accion', component: PlanAccionComponent },
  { path: 'nota-incumplimiento', component: NotaIncumplimientoComponent },
  { path: 'evaluar-resultados', component: EvaluarResultadosComponent },
  { path: 'determinar-causa', component: DeterminarCausaComponent },
  { path: 'acta-administrativa', component: ActaAdministrativaComponent },
  { path: 'login', component: LoginComponent },
  { path: 'usuario', component: UsuarioComponent },
  { path: 'admin', component: AdminComponent },

];