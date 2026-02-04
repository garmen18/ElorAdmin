import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { ReunionesService, Reunion } from '../../services/reuniones.service';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';
import { MiniReunionesComponent } from '../home/mini-reuniones/mini-reuniones.component';
import { FormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-profesor-reuniones',
  standalone: true,
  templateUrl: './profesor-reuniones.component.html',
  imports: [CommonModule, MiniReunionesComponent, FormsModule]
})
export class ProfesorReunionesComponent implements OnInit {

  reuniones: Reunion[] = [];
  cargando = true;

  private profesorId = 0;

  lang = 'es';

  textos: any = {
    es: {
      misReuniones: 'Mis reuniones',
      cargando: 'Cargando...',
      crearNueva: 'Crear nueva reunión',
      nuevaReunion: 'Nueva reunión',
      alumno: 'Alumno (ID)',
      fecha: 'Fecha',
      hora: 'Hora',
      centro: 'Centro (CCEN)',
      titulo: 'Título',
      asunto: 'Asunto',
      aula: 'Aula',
      crear: 'Crear reunión'
    },
    eu: {
      misReuniones: 'Nire bilerak',
      cargando: 'Kargatzen...',
      crearNueva: 'Bilera berria sortu',
      nuevaReunion: 'Bilera berria',
      alumno: 'Ikaslea (ID)',
      fecha: 'Data',
      hora: 'Ordua',
      centro: 'Zentroa (CCEN)',
      titulo: 'Izenburua',
      asunto: 'Gaia',
      aula: 'Gela',
      crear: 'Bilera sortu'
    },
    en: {
      misReuniones: 'My meetings',
      cargando: 'Loading...',
      crearNueva: 'Create new meeting',
      nuevaReunion: 'New meeting',
      alumno: 'Student (ID)',
      fecha: 'Date',
      hora: 'Time',
      centro: 'Center (CCEN)',
      titulo: 'Title',
      asunto: 'Subject',
      aula: 'Room',
      crear: 'Create meeting'
    }
  };

  form = {
  profesor_id: 0,
  alumno_id: null as number | null,
  fecha: '',
  hora: '',
  id_centro: '15112',
  titulo: '',
  asunto: '',
  aula: '',
  estado: 'pendiente'   
};


  constructor(
    private reunServ: ReunionesService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    this.auth.readyUser$.pipe(take(1)).subscribe(user => {
      this.profesorId = Number(user.id);
      this.form.profesor_id = this.profesorId;
      this.cargarReuniones();
    });
  }

  t(key: string) {
    return this.textos[this.lang][key];
  }

  cambiarIdioma(idioma: string) {
    this.lang = idioma;
  }

  cargarReuniones() {
    if (!this.profesorId) {
      this.reuniones = [];
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.cdr.detectChanges();

    this.reunServ.getReunionesProfesor(this.profesorId).subscribe({
      next: lista => {
        this.zone.run(() => {
          this.reuniones = lista;
          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.reuniones = [];
          this.cargando = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  crearReunion() {
    if (!this.profesorId) return;

    this.form.profesor_id = this.profesorId;

    this.reunServ.crearReunion(this.form).subscribe(() => {
      this.cargarReuniones();
    });
  }
}
