import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorariosService, HorarioItem } from '../../services/horarios.service';
import { AuthService } from '../../core/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profesor-horario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profesor-horario.component.html'
})
export class ProfesorHorarioComponent implements OnInit {

  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
  horas = [1, 2, 3, 4, 5, 6];

  tabla: any = {};
  cargando = true;

  constructor(
    private horarios: HorariosService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.auth.readyUser$.pipe(take(1)).subscribe({
      next: (user: any) => {

        const id = Number(user?.id);

        this.horarios.getHorarioCompletoProfesor(id)
.subscribe({
          next: (lista: HorarioItem[]) => {

            this.tabla = this.horarios.buildTablaHorario(lista);
            this.cargando = false;

            // FORZAR REFRESCO DE LA VISTA
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }
}
