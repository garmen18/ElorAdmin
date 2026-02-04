import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Reunion {
  id: number;
  fecha: string;            
  hora: string | null;     
  asunto: string | null;
  estado: string | null;
  alumno: string | null;
  profesor: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReunionesService {

  private api = 'http://localhost:3000/reuniones';

  constructor(private http: HttpClient) {}

  getReunionesProfesor(profeId: number): Observable<Reunion[]> {
    const id = Number(profeId);
    if (!id) return of([]);
    return this.http.get<any[]>(`${this.api}/profesor/${id}`).pipe(
      map(lista => this.mapearReuniones(lista))
    );
  }

  getReunionesAlumno(alumId: number): Observable<Reunion[]> {
    const id = Number(alumId);
    if (!id) return of([]);
    return this.http.get<any[]>(`${this.api}/alumno/${id}`).pipe(
      map(lista => this.mapearReuniones(lista))
    );
  }

  crearReunion(data: any) {
    return this.http.post(`${this.api}`, data);
  }

  private mapearReuniones(lista: any[]): Reunion[] {
    return (lista || [])
      .map(item => {
        const fechaStr: string = item.fecha;
        const d = fechaStr ? new Date(fechaStr) : null;

        const hora = d
          ? d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
          : null;

        return {
          id: item.id,
          fecha: fechaStr,
          hora,
          asunto: item.asunto ?? null,
          estado: item.estado ?? null,
          alumno: item.alumno_nombre
            ? `${item.alumno_nombre} ${item.alumno_apellidos || ''}`.trim()
            : null,
          profesor: item.profesor_nombre
            ? `${item.profesor_nombre} ${item.profesor_apellidos || ''}`.trim()
            : null
        };
      })
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }
}
