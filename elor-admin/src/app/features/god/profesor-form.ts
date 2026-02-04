import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-profesor-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profesor-form.html'
})
export class ProfesorFormComponent implements OnInit {

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

    // Crear formulario
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: [''] 
    });

    // Si estamos editando, cargar datos
    if (this.id) {
      this.usuarios.getProfesorById(this.id).subscribe((prof: any) => {
        this.form.patchValue({
          nombre: prof.nombre,
          apellidos: prof.apellidos,
          email: prof.email
        });
      });
    }
  }

  guardar() {
    const data = this.form.value;

    if (this.id) {
      this.usuarios.actualizarProfesor(this.id, data).subscribe(() => {
        this.router.navigate(['/god/profesores']);
      });
    } else {
      this.usuarios.crearProfesor(data).subscribe(() => {
        this.router.navigate(['/god/profesores']);
      });
    }
  }
}
