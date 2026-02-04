import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { take, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-profesor-buscar-alumnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profesor-buscar-alumnos.component.html'
})
export class ProfesorBuscarAlumnosComponent implements OnInit {

  alumnos: any[] = [];
  alumnosFiltrados: any[] = [];
  filtro = '';
  esAlumno = false;
  cargando = true;

  tipo = 0;
  centroId: number | null = null;

  constructor(
    private usuarios: UsuariosService,
    private router: Router,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auth.readyUser$.pipe(take(1)).subscribe({
      next: (user) => {
        this.tipo = Number(user.tipo_id);
        this.esAlumno = this.tipo === 4;

        // PROFESOR → filtrar por su centro
        if (this.tipo === 3) {
          this.centroId = Number(user.id_centro);
        }

        this.usuarios.getAlumnos().pipe(
          finalize(() => {
            this.cargando = false;
            this.cdr.detectChanges();
          })
        ).subscribe(a => {
          this.alumnos = a || [];

          // PROFESOR → filtrar por centro
          if (this.tipo === 3 && this.centroId) {
            this.alumnos = this.alumnos.filter(x => x.id_centro === this.centroId);
          }

          this.alumnosFiltrados = [...this.alumnos];
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar() {
    const f = this.filtro.toLowerCase();
    this.alumnosFiltrados = this.alumnos.filter(a =>
      (a.nombre || '').toLowerCase().includes(f) ||
      (a.apellidos || '').toLowerCase().includes(f) ||
      (a.email || '').toLowerCase().includes(f)
    );
  }

  consultar(id: number) {
    this.router.navigate(['/usuario', id]);
  }
}
