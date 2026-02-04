import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-alumno-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './alumno-form.html'
})
export class AlumnoFormComponent implements OnInit {

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
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['']
    });

    if (this.id) {
      this.usuarios.getAlumnoById(this.id).subscribe((alumno: any) => {
        this.form.patchValue(alumno);
      });
    }
  }

  guardar() {
    const data = this.form.value;

    if (this.id) {
      this.usuarios.actualizarAlumno(this.id, data).subscribe(() => {
        this.router.navigate(['/god/alumnos']);
      });
    } else {
      this.usuarios.crearAlumno(data).subscribe(() => {
        this.router.navigate(['/god/alumnos']);
      });
    }
  }
}
