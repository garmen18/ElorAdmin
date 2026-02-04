import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.readyUser$.pipe(
      take(1),
      map(user => {
        const tipo = Number(user.tipo_id);

        if (tipo === 1 || tipo === 2) return true;

        this.router.navigate(['/home']);
        return false;
      })
    );
  }
}
