import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { map, startWith, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  templateUrl: './layout.html',
  styleUrls: ['./layout.scss']
})
export class Layout {
  private auth = inject(AuthService);
  public router = inject(Router);

  // Tipo estable (0 mientras no haya user listo)
  tipo$ = this.auth.user$.pipe(
    map(user => (user ? Number(user.tipo_id) : 0)),
    startWith(0),
    shareReplay(1)
  );

  irHome() {
    // evita navegar “a lo mismo” si ya estás en /home
    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    }
  }

  logout() {
    this.auth.logout();
  }
}
