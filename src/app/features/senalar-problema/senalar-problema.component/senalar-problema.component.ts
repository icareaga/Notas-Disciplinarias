import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
 
import { CasoCreate } from '../../../models/caso-create.model';
import { Categoria } from '../../../models/categoria.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { CasosService } from '../../../services/casos.service';
import { CategoriasService } from '../../../services/categorias.service';
import { AuthService } from '../../../services/auth.service';
import { NavigationButtonsComponent } from '../../../shared/navigation-buttons/navigation-buttons.component';

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
  imports: [CommonModule, FormsModule, NavigationButtonsComponent],
  templateUrl: './senalar-problema.component.html',
  styleUrls: ['./senalar-problema.component.scss']
})
export class SenalarProblemaComponent implements OnInit {
 
  empleados: any[] = [];
  categorias: Categoria[] = [];
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
    private router: Router
  ) {}

  compareNumbers(o1: any, o2: any): boolean {
    return o1 === o2;
  }

  getCategoriaId(categoria: any): number {
    return categoria.id_Categoria || categoria.Id_Categoria || categoria.idCategoria || 0;
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
  }

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
      alert('Completa todos los campos obligatorios');
      return;
    }

    // Verificar que la categoría existe
    const categoriaExiste = this.categorias.find(c => {
      const id = c.id_Categoria || (c as any).Id_Categoria || (c as any).idCategoria;
      return id === this.nuevoCaso.idCategoria;
    });
    
    if (!categoriaExiste) {
      alert(`Error: La categoría con ID ${this.nuevoCaso.idCategoria} no existe. Selecciona una categoría válida.`);
      console.error('❌ Categoría no encontrada. Buscando ID:', this.nuevoCaso.idCategoria);
      console.error('❌ Categorías disponibles:', this.categorias);
      return;
    }

    // FORZAR id_paso a 1 (siempre inicia en paso 1 de 6)
    this.nuevoCaso.idPaso = 1;
    
    // FORZAR id_paso a 1 (siempre inicia en paso 1 de 6)
    this.nuevoCaso.idPaso = 1;
    
    console.log('📤 ENVIANDO CASO COMPLETO:', this.nuevoCaso);
    console.log('✅ Categoría verificada:', categoriaExiste.nombre);
    console.log('✅ idPaso FORZADO a 1:', this.nuevoCaso.idPaso);
    console.log('✅ idPaso FORZADO a 1:', this.nuevoCaso.idPaso);
    
    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: (respuesta: any) => {
        console.log('✅ Caso creado:', respuesta);
        alert('Caso creado correctamente');
        this.nuevoCaso = { 
          idUsuario: 0, 
          idCategoria: 0, 
          descripcion: '', 
          impacto: '', 
          conducta: '',
          idUsuarioJefe: this.nuevoCaso.idUsuarioJefe,
          estatus: 1
        };
      },
      error: (err) => {
        console.error('❌ Error:', err);
        console.error('Status:', err.status);
        console.error('Error detalle:', err.error);
        alert(`Error al crear el caso: ${err.error?.message || err.statusText || 'Error desconocido'}`);
      }
    });
  }
}
