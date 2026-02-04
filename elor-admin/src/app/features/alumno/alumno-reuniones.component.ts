import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReunionesService, Reunion } from '../../services/reuniones.service';
import { AuthService } from '../../core/auth.service';
import { MiniReunionesComponent } from '../home/mini-reuniones/mini-reuniones.component';
import { take, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-alumno-reuniones',
  standalone: true,
  imports: [CommonModule, MiniReunionesComponent],
  templateUrl: './alumno-reuniones.component.html'
})
export class AlumnoReunionesComponent implements OnInit {

  reuniones: Reunion[] = [];
  cargando = true;

  private alumnoId = 0;

  constructor(
    private reunServ: ReunionesService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.auth.readyUser$.pipe(take(1)).subscribe({
      next: (user: any) => {
        this.alumnoId = Number(user.id);
        this.cargarReuniones();
      },
      error: () => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarReuniones() {
    if (!this.alumnoId) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;

    this.reunServ.getReunionesAlumno(this.alumnoId).pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (lista) => {
        this.reuniones = lista;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }
}
