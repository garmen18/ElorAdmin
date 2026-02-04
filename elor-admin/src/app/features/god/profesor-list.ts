import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-profesor-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profesor-list.html'
})
export class ProfesorListComponent implements OnInit {

  profesores: any[] = [];
  profesoresFiltrados: any[] = [];
  filtro: string = '';

  constructor(private usuarios: UsuariosService) {}

  ngOnInit() {
    this.usuarios.getProfesores().subscribe(p => {
      this.profesores = p;
      this.profesoresFiltrados = p;
    });
  }

  buscar() {
    const t = this.filtro.toLowerCase().trim();
    this.profesoresFiltrados = this.profesores.filter(p =>
      p.nombre.toLowerCase().includes(t) ||
      p.apellidos.toLowerCase().includes(t) ||
      p.email.toLowerCase().includes(t)
    );
  }

  borrar(id: number) {
    this.usuarios.borrarProfesor(id).subscribe(() => {
      this.profesores = this.profesores.filter(x => x.id !== id);
      this.buscar();
    });
  }
}
