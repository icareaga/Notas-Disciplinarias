import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CasoCreate } from '../../../models/caso-create.model';

import { UsuariosService } from '../../../services/usuarios.service';

import { CasosService } from '../../../services/casos.service';

@Component({
  selector: 'app-senalar-problema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './senalar-problema.component.html',
  styleUrls: ['./senalar-problema.component.scss']
})
export class SenalarProblemaComponent implements OnInit {

  // 👥 empleados que vienen del SP de jerarquía
  empleados: any[] = [];

  // 📚 catálogo de categorías (definido por RH)
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

  // 🧾 modelo alineado 100% con backend
  nuevoCaso: CasoCreate = {
    idUsuarioAfectado: 0,
    idCategoria: 0,
    descripcion: ''
  };

  constructor(
    private usuariosService: UsuariosService,
    private casosService: CasosService
  ) {}

  ngOnInit(): void {
    // 🔴 temporal: plaza de Joaquín
    // luego esto vendrá del login
    this.usuariosService.obtenerJerarquia('114687')
      .subscribe({
        next: (data: any[]) => this.empleados = data,
        error: () => alert('Error al cargar jerarquía')
      });
  }

  crearCaso(): void {
    if (
      !this.nuevoCaso.idUsuarioAfectado ||
      !this.nuevoCaso.idCategoria ||
      !this.nuevoCaso.descripcion.trim()
    ) {
      alert('Completa todos los campos obligatorios');
      return;
    }

    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: () => {
        alert('Caso creado correctamente');
        this.nuevoCaso = {
          idUsuarioAfectado: 0,
          idCategoria: 0,
          descripcion: ''
        };
      },
      error: () => alert('Error al crear el caso')
    });
  }
}
