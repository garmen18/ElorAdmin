import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-alumno-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './alumno-list.html'
})
export class AlumnoListComponent implements OnInit {

  alumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  filtro: string = '';

  constructor(private usuarios: UsuariosService) {}

  ngOnInit() {
    this.usuarios.getAlumnos().subscribe(a => {
      this.alumnos = a;
      this.alumnosFiltrados = a;
    });
  }

  buscar() {
    const t = this.filtro.toLowerCase().trim();
    this.alumnosFiltrados = this.alumnos.filter(a =>
      a.nombre.toLowerCase().includes(t) ||
      a.apellidos.toLowerCase().includes(t) ||
      a.email.toLowerCase().includes(t)
    );
  }

  borrar(id: number) {
    this.usuarios.borrarAlumno(id).subscribe(() => {
      this.alumnos = this.alumnos.filter(x => x.id !== id);
      this.buscar();
    });
  }
}
