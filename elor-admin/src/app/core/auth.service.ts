import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { filter, map, distinctUntilChanged, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private api = 'http://localhost:3000/auth';
  private platformId = inject(PLATFORM_ID);

  private userSubject = new BehaviorSubject<any>(null);

  user$ = this.userSubject.asObservable();

  
   
  readyUser$ = this.user$.pipe(
    filter((u: any) => !!u && !!u.id && !!u.tipo_id),
    map((u: any) => ({ ...u, id: Number(u.id), tipo_id: Number(u.tipo_id) })),
    distinctUntilChanged((a, b) => a.id === b.id && a.tipo_id === b.tipo_id),
    shareReplay(1)
  );

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const saved = localStorage.getItem('user');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.userSubject.next(parsed);
        } catch (e) {
          console.error('Error al parsear usuario guardado:', saved);
          localStorage.removeItem('user');
          this.userSubject.next(null);
        }
      }
    }
  }

  login(data: { email: string; password: string }) {
    return this.http.post(`${this.api}/login`, data);
  }

  saveUser(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  getUser() {
    return this.userSubject.value;
  }

  getTipo(): number {
    const user = this.userSubject.value;
    return user ? Number(user.tipo_id) : 0;
  }

  getId(): number {
    const user = this.userSubject.value;
    return user ? Number(user.id) : 0;
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('user');
    }
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
