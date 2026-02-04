import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../core/auth.service';
import { UsuariosService } from '../../services/usuarios.service';
import { HorariosService } from '../../services/horarios.service';
import { ReunionesService } from '../../services/reuniones.service';

import { MiniHorarioComponent } from './mini-horario/mini-horario.component';
import { MiniReunionesComponent } from './mini-reuniones/mini-reuniones.component';

import { forkJoin, of } from 'rxjs';
import { take, switchMap, catchError, finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MiniHorarioComponent, MiniReunionesComponent],
  templateUrl: './home.html'
})
export class HomeComponent implements OnInit {

  tipo = 0;
  user: any = null;

  stats: any;
  admins: any[] = [];
  profesores: any[] = [];
  alumnos: any[] = [];

  buscados: any[] = [];
  textoBusqueda = '';

  miniHorario: any[] = [];
  proximasReuniones: any[] = [];

  cargando = true;

  constructor(
    private auth: AuthService,
    private usuarios: UsuariosService,
    private http: HttpClient,
    private horarios: HorariosService,
    private reuniones: ReunionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.auth.readyUser$.pipe(
      take(1),
      tap(user => console.log(' [HOME] READY USER:', user)),
      switchMap((user: any) => {
        const id = Number(user.id);
        const tipo = Number(user.tipo_id);


        this.user = user;
        this.tipo = tipo;

        if (tipo === 1 || tipo === 2) {
          return forkJoin({
            stats: this.http.get('http://localhost:3000/stats').pipe(catchError(() => of(null))),
            admins: this.usuarios.getAdministradores().pipe(catchError(() => of([]))),
            profesores: this.usuarios.getProfesores().pipe(catchError(() => of([]))),
            alumnos: this.usuarios.getAlumnos().pipe(catchError(() => of([])))
          });
        }

        if (tipo === 3) {
          return forkJoin({
            horario: this.horarios.getHorarioCompletoProfesor(id)
.pipe(catchError(() => of([]))),
            reuniones: this.reuniones.getReunionesProfesor(id).pipe(catchError(() => of([])))
          });
        }

        if (tipo === 4) {
          return forkJoin({
            horario: this.horarios.getHorarioCompletoAlumno(id)
.pipe(catchError(() => of([]))),
            reuniones: this.reuniones.getReunionesAlumno(id).pipe(catchError(() => of([])))
          });
        }

        return of(null);
      }),
      tap(result => console.log(' [HOME] result:', result)),
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges(); 
      })
    ).subscribe({
      next: (result) => {
        if (!result) return;

        if (this.tipo === 1 || this.tipo === 2) {
          this.stats = (result as any).stats;
          this.admins = (result as any).admins || [];
          this.profesores = (result as any).profesores || [];
          this.alumnos = (result as any).alumnos || [];
        } else {
          const r = result as any;
          this.miniHorario = this.extraerMiniHorario(r.horario || []);
          this.proximasReuniones = this.extraerProximasReuniones(r.reuniones || []);
        }

        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('[HOME] error al cargar datos', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  buscar() {
    if (this.textoBusqueda.trim().length === 0) {
      this.buscados = [];
      return;
    }
    this.usuarios.buscar(this.textoBusqueda)
      .pipe(catchError(() => of([])))
      .subscribe((r: any[]) => {
        this.buscados = r;
        this.cdr.detectChanges();
      });
  }

  borrarAdmin(id: number) {
    this.usuarios.borrarAdmin(id).subscribe(() => {
      this.admins = this.admins.filter(x => x.id !== id);
      this.cdr.detectChanges();
    });
  }

  borrarProfesor(id: number) {
    this.usuarios.borrarProfesor(id).subscribe(() => {
      this.profesores = this.profesores.filter(x => x.id !== id);
      this.cdr.detectChanges();
    });
  }

  borrarAlumno(id: number) {
    this.usuarios.borrarAlumno(id).subscribe(() => {
      this.alumnos = this.alumnos.filter(x => x.id !== id);
      this.cdr.detectChanges();
    });
  }

  private extraerMiniHorario(horario: any[]): any[] {
    return (horario || []).slice(0, 3);
  }

  private extraerProximasReuniones(reuniones: any[]): any[] {
    return (reuniones || []).slice(0, 3);
  }
}
