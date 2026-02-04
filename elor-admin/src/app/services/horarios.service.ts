import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReunionesService, Reunion } from './reuniones.service';

export interface HorarioItem {
  id: number;
  dia: string;
  hora: number;
  modulo: string;
  aula: string | null;
  observaciones: string | null;
  estado?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HorariosService {

  private api = 'http://localhost:3000/horarios';

  constructor(
    private http: HttpClient,
    private reunionesSrv: ReunionesService
  ) {}


  getHorarioProfesor(profeId: number): Observable<HorarioItem[]> {
    const id = Number(profeId);
    if (!id) return of([]);
    return this.http.get<any[]>(`${this.api}/profesor/${id}`).pipe(
      map(lista => this.mapearHorario(lista))
    );
  }

  getHorarioAlumno(alumId: number): Observable<HorarioItem[]> {
    const id = Number(alumId);
    if (!id) return of([]);
    return this.http.get<any[]>(`${this.api}/alumno/${id}`).pipe(
      map(lista => this.mapearHorario(lista))
    );
  }

  private mapearHorario(lista: any[]): HorarioItem[] {
    return (lista || []).map(item => ({
      id: item.id,
      dia: item.dia,
      hora: Number(item.hora),
      modulo: item.modulo_nombre,
      aula: item.aula ?? null,
      observaciones: item.observaciones ?? null
    }));
  }

  // FUSIÓN HORARIO + REUNIONES

  private fusionarReuniones(horario: HorarioItem[], reuniones: Reunion[]): HorarioItem[] {
  const dias = ['DOMINGO','LUNES','MARTES','MIERCOLES','JUEVES','VIERNES','SABADO'];

  reuniones.forEach(r => {
    const fecha = new Date(r.fecha);
    const dia = dias[fecha.getDay()];

    if (!['LUNES','MARTES','MIERCOLES','JUEVES','VIERNES'].includes(dia)) return;

    const horaReal = fecha.getHours();
    let horaLectiva: number | null = null;

    if (horaReal >= 8 && horaReal < 9) horaLectiva = 1;
    else if (horaReal >= 9 && horaReal < 10) horaLectiva = 2;
    else if (horaReal >= 10 && horaReal < 11) horaLectiva = 3;
    else if (horaReal >= 11 && horaReal < 12) horaLectiva = 4;
    else if (horaReal >= 12 && horaReal < 13) horaLectiva = 5;
    else if (horaReal >= 13 && horaReal < 14) horaLectiva = 6;

    if (!horaLectiva) return;

    let color = '';
    if (r.estado === 'pendiente') color = 'yellow';
    else if (r.estado === 'aceptada') color = 'lightgreen';
    else if (r.estado === 'conflicto') color = 'lightcoral';

    horario.push({
    id: r.id,
    dia,
    hora: horaLectiva,
    modulo: 'REUNIÓN',
    aula: null,
    observaciones: r.asunto,
    estado: r.estado,     
    color
  } as any);
  });

  return horario;
}

  // HORARIO COMPLETO (CON REUNIONES)

  getHorarioCompletoAlumno(id: number): Observable<HorarioItem[]> {
    return combineLatest([
      this.getHorarioAlumno(id),
      this.reunionesSrv.getReunionesAlumno(id)
    ]).pipe(
      map(([horario, reuniones]) =>
        this.fusionarReuniones([...horario], reuniones)
      )
    );
  }

  getHorarioCompletoProfesor(id: number): Observable<HorarioItem[]> {
    return combineLatest([
      this.getHorarioProfesor(id),
      this.reunionesSrv.getReunionesProfesor(id)
    ]).pipe(
      map(([horario, reuniones]) =>
        this.fusionarReuniones([...horario], reuniones)
      )
    );
  }

  // TABLA

  buildTablaHorario(lista: HorarioItem[]) {
  const tabla: any = {};

  for (const dia of ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']) {
    tabla[dia] = {};
    for (let h = 1; h <= 6; h++) {
      tabla[dia][h] = null;
    }
  }

  for (const item of lista) {
    const dia = item.dia;
    const hora = item.hora;

    if (!tabla[dia]) continue;

    tabla[dia][hora] = {
      ...item,
      claseEstado: this.getEstadoClase(item.estado)  
    };
  }

  return tabla;
}

getEstadoClase(estado: string | null | undefined): string {
  switch ((estado || '').toLowerCase()) {
    case 'pendiente': return 'bg-warning text-dark';
    case 'aceptada': return 'bg-success text-white';
    case 'conflicto': return 'bg-danger text-white';
    default: return 'bg-light text-dark';
  }
}
}
