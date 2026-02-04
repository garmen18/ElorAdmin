import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GodGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.readyUser$.pipe(
      take(1),
      map(user => {
        if (Number(user.tipo_id) !== 1) {
          this.router.navigate(['/home']);
          return false;
        }
        return true;
      })
    );
  }
}
