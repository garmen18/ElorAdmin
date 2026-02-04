import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // Si no hay usuario guardado → fuera inmediatamente (sin esperar)
    if (!this.auth.getUser()) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // Si hay usuario, esperamos a que sea "ready" (id/tipo_id válidos)
    return this.auth.readyUser$.pipe(
      take(1),
      map(() => true)
    );
  }
}
