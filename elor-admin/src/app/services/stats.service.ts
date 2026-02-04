import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stats } from './stats.model';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  private api = 'http://localhost:3000/stats';

  constructor(private http: HttpClient) {}

  getStats() {
    return this.http.get<Stats>(this.api);
  }
}
