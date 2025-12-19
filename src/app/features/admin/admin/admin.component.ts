import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CasoCreate } from "../../../models/caso-create.model";

import { CasosService } from "../../../services/casos.service";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  casos: any[] = [];

  nuevoCaso: CasoCreate = {
    idUsuarioAfectado: 0,
    idCategoria: 0,
    descripcion: ''
  };

  constructor(private casosService: CasosService) {}

  ngOnInit(): void {
    this.cargarCasos();
  }

  cargarCasos(): void {
    this.casosService.obtenerCasos().subscribe({
      next: (data: any[]) => this.casos = data,
      error: () => alert('Error al cargar casos')
    });
  }

  crearCaso(): void {
    if (
      !this.nuevoCaso.idUsuarioAfectado ||
      !this.nuevoCaso.idCategoria ||
      !this.nuevoCaso.descripcion.trim()
    ) {
      return;
    }

    this.casosService.crearCaso(this.nuevoCaso).subscribe({
      next: () => {
        this.nuevoCaso = {
          idUsuarioAfectado: 0,
          idCategoria: 0,
          descripcion: ''
        };
        this.cargarCasos();
      },
      error: () => alert('Error al crear el caso')
    });
  }
}
