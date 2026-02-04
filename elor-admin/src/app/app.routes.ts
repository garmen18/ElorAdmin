import { Routes } from '@angular/router';

import { LoginComponent } from './features/login/login';
import { HomeComponent } from './features/home/home';
import { Layout } from './shared/layout/layout';

import { GodGuard } from './guards/god.guard';
import { AdminGuard } from './guards/admin.guard';
import { ProfesorGuard } from './guards/profesor.guard';
import { AlumnoGuard } from './guards/alumno.guard';
import { AuthGuard } from './core/auth.guard';

import { ProfesorBuscarAlumnosComponent } from './features/profesor/profesor-buscar-alumnos.component';
import { ProfesorBuscarProfesoresComponent } from './features/profesor/profesor-buscar-profesores.component';
import { UsuarioDetalleComponent } from './features/usuario-detalle/usuario-detalle.component';

export const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: Layout,
    children: [

      { path: 'home', component: HomeComponent },

      // ADMINISTRADORES (solo GOD)
      {
        path: 'god/admins',
        loadComponent: () =>
          import('./features/god/admin-list').then(m => m.AdminListComponent),
        canActivate: [GodGuard]
      },
      {
        path: 'god/admins/nuevo',
        loadComponent: () =>
          import('./features/god/admin-form').then(m => m.AdminFormComponent),
        canActivate: [GodGuard]
      },
      {
        path: 'god/admins/editar/:id',
        loadComponent: () =>
          import('./features/god/admin-form').then(m => m.AdminFormComponent),
        canActivate: [GodGuard]
      },

      // PROFESORES (God + Admin)
      {
        path: 'god/profesores',
        loadComponent: () =>
          import('./features/god/profesor-list').then(m => m.ProfesorListComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'god/profesores/nuevo',
        loadComponent: () =>
          import('./features/god/profesor-form').then(m => m.ProfesorFormComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'god/profesores/:id',
        loadComponent: () =>
          import('./features/god/profesor-form').then(m => m.ProfesorFormComponent),
        canActivate: [AdminGuard]
      },

      // ALUMNOS (God + Admin)
      {
        path: 'god/alumnos',
        loadComponent: () =>
          import('./features/god/alumno-list').then(m => m.AlumnoListComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'god/alumnos/nuevo',
        loadComponent: () =>
          import('./features/god/alumno-form').then(m => m.AlumnoFormComponent),
        canActivate: [AdminGuard]
      },
      {
        path: 'god/alumnos/:id',
        loadComponent: () =>
          import('./features/god/alumno-form').then(m => m.AlumnoFormComponent),
        canActivate: [AdminGuard]
      },

      // PROFESOR
      {
        path: 'prof/horario',
        loadComponent: () =>
          import('./features/profesor/profesor-horario.component')
            .then(m => m.ProfesorHorarioComponent),
        canActivate: [ProfesorGuard]
      },
      {
        path: 'prof/reuniones',
        loadComponent: () =>
          import('./features/profesor/profesor-reuniones.component')
            .then(m => m.ProfesorReunionesComponent),
        canActivate: [ProfesorGuard]
      },
      {
        path: 'prof/alumnos',
        component: ProfesorBuscarAlumnosComponent,
        canActivate: [ProfesorGuard]
      },
      {
        path: 'prof/profesores',
        component: ProfesorBuscarProfesoresComponent,
        canActivate: [ProfesorGuard]
      },
      // ALUMNO
      {
        path: 'alumno/horario',
        loadComponent: () =>
          import('./features/alumno/alumno-horario.component')
            .then(m => m.AlumnoHorarioComponent),
        canActivate: [AlumnoGuard]
      },
      {
        path: 'alumno/reuniones',
        loadComponent: () =>
          import('./features/alumno/alumno-reuniones.component')
            .then(m => m.AlumnoReunionesComponent),
        canActivate: [AlumnoGuard]
      },

      //consulta
      { 
        path: 'usuario/:id', 
        loadComponent: () => import('./features/usuario-detalle/usuario-detalle.component')
          .then(m => m.UsuarioDetalleComponent)
      },
      //CENTROS
      {
        path: 'centros',
        loadComponent: () =>
          import('./features/centros/centros-list.component').then(m => m.CentrosListComponent)
      },
      {
  path: 'centros/:ccen',
  loadComponent: () =>
    import('./features/centros/centro-detail.component')
      .then(m => m.CentroDetailComponent)
},

    ]
  },

  { path: '**', redirectTo: 'login' }
];