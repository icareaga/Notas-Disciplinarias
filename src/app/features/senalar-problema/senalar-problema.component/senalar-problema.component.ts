import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
import { CasoCreate } from '../../../models/caso-create.model';
import { Categoria } from '../../../models/categoria.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { CasosService } from '../../../services/casos.service';
import { CategoriasService } from '../../../services/categorias.service';
import { AuthService } from '../../../services/auth.service';

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
  imports: [CommonModule, FormsModule],
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
    estatus: 1  // Por defecto 1 = Activo
  };

  constructor(
    private usuariosService: UsuariosService,
    private casosService: CasosService,
    private categoriasService: CategoriasService,
    private authService: AuthService
  ) {}

  onColaboradorChange(event: any): void {
    const valor = event.target.value;
    console.log('👤 Colaborador raw:', valor, typeof valor);
    const numValue = Number(valor);
    console.log('👤 Colaborador convertido:', numValue, 'NaN?', isNaN(numValue));
    if (!isNaN(numValue) && numValue > 0) {
      this.nuevoCaso.idUsuario = numValue;
    }
  }

  onCategoriaChange(event: any): void {
    const valor = event.target.value;
    console.log('📂 Categoría raw:', valor, typeof valor);
    const numValue = Number(valor);
    console.log('📂 Categoría convertido:', numValue, 'NaN?', isNaN(numValue));
    if (!isNaN(numValue) && numValue > 0) {
      this.nuevoCaso.idCategoria = numValue;
    }
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
          console.log('🔍 🔍 🔍 CATEGORÍAS - PROPIEDADES:', Object.keys(this.categorias[0]));
          console.log('🔍 CATEGORÍAS - Primera como JSON:', JSON.stringify(this.categorias[0]));
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

    console.log('📤 ENVIANDO CASO COMPLETO:', this.nuevoCaso);
    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: (respuesta: any) => {
        console.log('✅ Caso creado:', respuesta);
        alert('Caso creado correctamente');
        this.nuevoCaso = { idUsuario: 0, idCategoria: 0, descripcion: '', impacto: '', conducta: '' };
      },
      error: (err) => {
        console.error('❌ Error:', err);
        console.error('Status:', err.status);
        console.error('Error detalle:', err.error);
        alert(`Error: ${err.error?.message || err.statusText}`);
      }
    });
  }
}
