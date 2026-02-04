import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-admin-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-form.html'
})
export class AdminFormComponent implements OnInit {

  id?: number;
  form!: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private usuarios: UsuariosService
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.form = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    if (this.id) {
      this.usuarios.getAdminById(this.id).subscribe((admin: any) => {
        this.form.patchValue({
          nombre: admin.nombre,
          email: admin.email
        });
      });
    }
  }

  guardar() {
    const data = this.form.value;

    if (this.id) {
      this.usuarios.actualizarAdmin(this.id, data).subscribe(() => {
        this.router.navigate(['/god/admins']);
      });
    } else {
      this.usuarios.crearAdmin(data).subscribe(() => {
        this.router.navigate(['/god/admins']);
      });
    }
  }
}
