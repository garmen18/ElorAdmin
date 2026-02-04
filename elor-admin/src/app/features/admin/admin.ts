import { Component } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {

  constructor(public auth: AuthService) {}

}
