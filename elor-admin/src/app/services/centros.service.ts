import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Centro } from '../models/centro.model';

export interface CentrosResponse {
  total: number;
  page: number;
  pageSize: number;
  items: Centro[];
}

@Injectable({ providedIn: 'root' })
export class CentrosService {
  private api = 'http://localhost:3000/centros';

  constructor(private http: HttpClient) {}

  getCentros(filters: { dtituc?: string; dterre?: string; dmunic?: string; q?: string; page?: number; pageSize?: number } = {}): Observable<CentrosResponse> {
    let params = new HttpParams();
    if (filters.dtituc) params = params.set('dtituc', filters.dtituc);
    if (filters.dterre) params = params.set('dterre', filters.dterre);
    if (filters.dmunic) params = params.set('dmunic', filters.dmunic);
    if (filters.q) params = params.set('q', filters.q);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.pageSize) params = params.set('pageSize', String(filters.pageSize));
    return this.http.get<CentrosResponse>(this.api, { params });
  }

  getCentro(codigo: number): Observable<Centro> {
  return this.http.get<Centro>(`${this.api}/${codigo}`);
}


  getOptions(): Observable<{ dtituc: string[]; dterr: string[]; dmunic: string[] }> {
    return this.http.get<{ dtituc: string[]; dterr: string[]; dmunic: string[] }>(`${this.api}/options/all`);
  }
}
