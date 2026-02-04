import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { HorariosService, HorarioItem } from '../../services/horarios.service';
import { ReunionesService, Reunion } from '../../services/reuniones.service';
import { CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-usuario-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor, DatePipe],
  templateUrl: './usuario-detalle.component.html'
})
export class UsuarioDetalleComponent implements OnInit {

  id = 0;
  usuario: any = null;

  horario: HorarioItem[] = [];
  tablaHorario: any = null;

  reuniones: Reunion[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private usuarios: UsuariosService,
    private horariosSrv: HorariosService,
    private reunionesSrv: ReunionesService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.id) {
      this.error = 'ID inválido';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargarUsuario();
  }

  cargarUsuario() {
    this.loading = true;
    this.error = null;
    this.cdr.detectChanges();

    this.usuarios.getAlumnoById(this.id).pipe(
      catchError(() => of(null)),
      switchMap((alumno: any) => {
        if (alumno) {
          this.usuario = alumno;

          return forkJoin({
            horario: this.horariosSrv.getHorarioCompletoAlumno(this.id).pipe(catchError(() => of([]))),
            reuniones: this.reunionesSrv.getReunionesAlumno(this.id).pipe(catchError(() => of([])))
          });
        }

        return this.usuarios.getProfesorById(this.id).pipe(
          catchError(() => of(null)),
          switchMap((prof: any) => {
            if (!prof) {
              this.usuario = null;
              this.error = 'Usuario no encontrado';
              return of({ horario: [], reuniones: [] });
            }

            this.usuario = prof;

            return forkJoin({
              horario: this.horariosSrv.getHorarioCompletoProfesor(this.id).pipe(catchError(() => of([]))),
              reuniones: this.reunionesSrv.getReunionesProfesor(this.id).pipe(catchError(() => of([])))
            });
          })
        );
      }),
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe((res: any) => {
      this.horario = res.horario || [];
      this.tablaHorario = this.horariosSrv.buildTablaHorario(this.horario);
      this.reuniones = res.reuniones || [];
      this.cdr.detectChanges();
    });
  }
}
