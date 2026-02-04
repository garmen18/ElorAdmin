import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-list.html'
})
export class AdminListComponent implements OnInit {

  admins: any[] = [];
  adminsFiltrados: any[] = [];
  filtro: string = '';

  constructor(private usuarios: UsuariosService) {}

  ngOnInit() {
    this.usuarios.getAdministradores().subscribe(a => {
      this.admins = a;
      this.adminsFiltrados = a;
    });
  }

  buscar() {
    const t = this.filtro.toLowerCase().trim();
    this.adminsFiltrados = this.admins.filter(a =>
      a.nombre.toLowerCase().includes(t) ||
      a.email.toLowerCase().includes(t)
    );
  }

  borrar(id: number) {
    this.usuarios.borrarAdmin(id).subscribe(() => {
      this.admins = this.admins.filter(x => x.id !== id);
      this.buscar();
    });
  }
}
