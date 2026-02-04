import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class LoginComponent {

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      email: [''],
      password: ['']
    });
  }

  onSubmit() {
    this.auth.login(this.form.value).subscribe({
      next: (resp: any) => {
        // Guardar el usuario tal cual lo devuelve el backend
        this.auth.saveUser(resp);

        // Navegar inmediatamente (saveUser ya hace next() en el BehaviorSubject)
        this.router.navigate(['/home'], { replaceUrl: true });
      },
      error: err => {
        console.error('[LOGIN] error', err);
      }
    });
  }
}
