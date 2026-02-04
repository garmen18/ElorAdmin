import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../core/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  private api = 'http://localhost:3000/usuarios';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  // LISTAS POR TIPO

  getAdministradores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/admins`);
  }

  getProfesores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/profesores`);
  }

  getAlumnos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/alumnos`);
  }

  // BUSCADOR GLOBAL (God/Admin)

  buscar(texto: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/buscar/${texto}`);
  }

  // GET BY ID (NECESARIO PARA FORMULARIOS)

  getAdminById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/admins/${id}`);
  }

  getProfesorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/profesores/${id}`);
  }

  getAlumnoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.api}/alumnos/${id}`);
  }

  // CRUD ESPECÍFICO POR TIPO

  crearProfesor(data: any): Observable<any> {
    return this.http.post(`${this.api}/profesores`, data);
  }

  actualizarProfesor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/profesores/${id}`, data);
  }

  borrarProfesor(id: number): Observable<any> {
    return this.http.delete(`${this.api}/profesores/${id}`);
  }

  crearAlumno(data: any): Observable<any> {
    return this.http.post(`${this.api}/alumnos`, data);
  }

  actualizarAlumno(id: number, data: any): Observable<any> {
    return this.http.put(`${this.api}/alumnos/${id}`, data);
  }

  borrarAlumno(id: number): Observable<any> {
    return this.http.delete(`${this.api}/alumnos/${id}`);
  }

  crearAdmin(data: any): Observable<any> {
    return this.http.post(`${this.api}/admins`, data);
  }

  actualizarAdmin(id: number, data: any): Observable<any> {
  return this.http.put(`${this.api}/admins/${id}`, data);
}


  borrarAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.api}/admins/${id}`);
  }

  // Consulta detalle: usuario + horario + reuniones

  getDetalleUsuario(id: number): Observable<any> {
    const userId = this.auth.getId();   
    const userTipo = this.auth.getTipo();

    if (!userId || userTipo === null || userTipo === undefined) {
      throw new Error('Usuario no autenticado: no se puede pedir detalle');
    }

    const headers = new HttpHeaders({
      'x-user-id': String(userId),
      'x-user-tipo': String(userTipo)
    });

    return this.http.get<any>(`${this.api}/${id}/detalle`, { headers });
  }
}
