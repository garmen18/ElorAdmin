import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profesor-buscar-profesores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesor-buscar-profesores.component.html'
})
export class ProfesorBuscarProfesoresComponent implements OnInit {

  profesores: any[] = [];
  profesoresFiltrados: any[] = [];
  filtro = '';
  cargando = true;

  constructor(
    private usuarios: UsuariosService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.usuarios.getProfesores().pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe(p => {
      this.profesores = p || [];
      this.profesoresFiltrados = p || [];
      this.cdr.detectChanges();
    });
  }

  buscar() {
    const f = this.filtro.toLowerCase();

    this.profesoresFiltrados = this.profesores.filter(p =>
      (p.nombre || '').toLowerCase().includes(f) ||
      (p.apellidos || '').toLowerCase().includes(f) ||
      (p.email || '').toLowerCase().includes(f)
    );
  }

  consultar(id: number) {
    this.router.navigate(['/usuario', id]);
  }
}
