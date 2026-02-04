import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorariosService, HorarioItem } from '../../services/horarios.service';
import { AuthService } from '../../core/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-alumno-horario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alumno-horario.component.html'
})
export class AlumnoHorarioComponent implements OnInit {

  dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'];
  horas = [1, 2, 3, 4, 5, 6];

  tabla: any = {};
  cargando = true;

  constructor(
    private horarios: HorariosService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.auth.readyUser$.pipe(take(1)).subscribe(user => {
      const id = Number(user.id);

      this.cargando = true;
      this.cdr.detectChanges();

      this.horarios.getHorarioCompletoAlumno(id).subscribe({
        next: (lista: HorarioItem[]) => {

          // Filtrar guardias y tutorías
          const filtrado = (lista || []).filter(item => {
            const mod = (item.modulo || '').toLowerCase().trim();
            return mod !== 'guardia' && mod !== 'tutoria' && mod !== 'tutoría';
          });

          this.zone.run(() => {
            this.tabla = this.horarios.buildTablaHorario(filtrado);
            this.cargando = false;
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.zone.run(() => {
            console.error('[HORARIO ALUMNO] error', err);
            this.tabla = {};
            this.cargando = false;
            this.cdr.detectChanges();
          });
        }
      });
    });
  }
}
