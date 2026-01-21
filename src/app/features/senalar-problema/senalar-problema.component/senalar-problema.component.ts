import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
import { CasoCreate } from '../../../models/caso-create.model';
import { UsuariosService } from '../../../services/usuarios.service';
import { CasosService } from '../../../services/casos.service';

/**
 * SENALARPROBLEMACOMPONENT - Formulario principal para crear notas disciplinarias
 * 
 * RESPONSABILIDADES:
 * 1. Mostrar lista de empleados subordinados del jefe autenticado
 * 2. Permitir seleccionar un empleado, categoría y describir el problema
 * 3. Enviar la nota al backend para guardarla
 * 
 * FLUJO:
 * 1. ngOnInit(): Lee el ID del usuario autenticado desde localStorage (viene del token JWT)
 * 2. Llama a UsuariosService.obtenerJerarquia(idUsuario) para traer sus subordinados
 * 3. Muestra dropdown con empleados para que el jefe seleccione a quién crear nota
 * 4. El jefe selecciona: empleado, categoría (problema), y descripción
 * 5. crearCaso(): Valida datos y envía POST a /api/Casos/crear
 * 6. Backend guarda la nota y retorna confirmación
 * 
 * NOTAS IMPORTANTES:
 * - Solo jefes pueden crear notas (ven sus subordinados)
 * - Las categorías están hardcodeadas en el componente (podrían venir de API)
 * - El modelo CasoCreate debe coincidir exactamente con lo que espera el backend
 */
@Component({
  selector: 'app-senalar-problema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './senalar-problema.component.html',
  styleUrls: ['./senalar-problema.component.scss']
})
export class SenalarProblemaComponent implements OnInit {
 
  /**
   * Lista de empleados subordinados del usuario autenticado
   * Se obtiene del backend usando /api/Usuarios/jerarquia/{idUsuario}
   * Estructura esperada: { idUsuario, nombreCompleto, correo, ... }
   */
  empleados: any[] = [];
 
  /**
   * Catálogo de categorías/tipos de incumplimiento disponibles
   * Estas categorías se muestran en el dropdown para que el jefe seleccione
   * TODO: Considerar traer esto del backend (/api/Categorias) en lugar de hardcodear
   */
  categorias: string[] = [
    'Agresión Física',
    'Baja Productividad',
    'Comunicación y respeto',
    'Desvío de rutas',
    'Falsificación de Información, documentos y/o firmas',
    'Falta de algún registro de asistencia',
    'Falta de entrega y/o comprobación de viáticos',
    'Falta de gestión de la herramienta de trabajo',
    'Falta de gestión de usuarios',
    'Faltas injustificadas',
    'Incumplimiento de capacitación',
    'Licencia vencida o extraviada',
    'Mal uso de la herramienta de trabajo',
    'Mala gestión de Uniformes',
    'Mala Instalación',
    'Multas de vialidad',
    'Omisión al proceso de gestión del desempeño',
    'Omisión de información para pago de variables',
    'Omisión del control de los servicios vehiculares',
    'Omisión en las actividades de su trabajo',
    'Omisión o error en la asignación de dependencias',
    'Omisión o error en la asignación de horarios',
    'Otros',
    'Positivo antidoping / Estado de ebriedad',
    'PRO´s / Postventa',
    'Retardos'
  ];
 
  /**
   * Modelo del caso que se está creando
   * Debe coincidir exactamente con CasoCreate en el backend
   * Propiedades:
   * - idUsuarioAfectado: ID del empleado a quien va la nota
   * - idCategoria: ID/índice de la categoría seleccionada
   * - descripcion: Texto describiendo el problema
   */
  nuevoCaso: CasoCreate = {
    idUsuarioAfectado: 0,
    idCategoria: 0,
    descripcion: '',
    impacto: '',
    conducta: ''
  };
 
  constructor(
    private usuariosService: UsuariosService,
    private casosService: CasosService
  ) {}
 
  /**
   * Inicialización del componente
   * - Obtiene el ID del usuario autenticado
   * - Carga la lista de sus subordinados desde el backend
   */
  ngOnInit(): void {
    // Leer datos del usuario autenticado desde localStorage
    // El token se decodificó en AppComponent y se guardó aquí
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
 
    if (!usuario?.Id) {
      console.error('No se encontró el ID del usuario logueado');
      return;
    }
 
    const idUsuario = String(usuario.Id);
 
    // Llamar al backend para obtener los subordinados de este jefe
    this.usuariosService.obtenerJerarquia(idUsuario).subscribe({
      next: (data: any) => {
        // Backend retorna { resultados: [...empleados...] }
        console.log('📋 Respuesta completa de API:', data);
        console.log('📋 Primer empleado:', data.resultados?.[0]);
        
        // Extraer array de empleados (o array vacío si no hay)
        this.empleados = data.resultados ?? [];
        console.log('✅ Empleados cargados:', this.empleados.length);
      },
      error: (err) => {
        console.error('❌ Error al cargar jerarquía:', err);
        alert('Error al cargar jerarquía de empleados');
      }
    });
  }
 
  /**
   * Crea un nuevo caso (nota disciplinaria)
   * - Valida que todos los campos requeridos estén completos
   * - Envía POST a /api/Casos/crear
   * - Limpia el formulario si es exitoso
   */
  crearCaso(): void {
    // Validación de campos obligatorios
    if (
      !this.nuevoCaso.idUsuarioAfectado ||
      !this.nuevoCaso.idCategoria ||
      !this.nuevoCaso.descripcion.trim() ||
      !this.nuevoCaso.impacto.trim() ||
      !this.nuevoCaso.conducta.trim()
    ) {
      alert('Completa todos los campos obligatorios');
      return;
    }
 
    // Enviar al backend
    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: () => {
        alert('Caso creado correctamente');
        // Limpiar formulario después de guardar
        this.nuevoCaso = {
          idUsuarioAfectado: 0,
          idCategoria: 0,
          descripcion: '',
          impacto: '',
          conducta: ''
        };
      },
      error: (err) => {
        console.error('❌ Error al crear caso:', err);
        alert('Error al crear el caso');
      }
    });
  }
}
