import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-horario',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-horario.component.html'
})
export class MiniHorarioComponent {

  filas: any[] = [];

  @Input()
  set datos(value: any[] | null | undefined) {
    const arr = Array.isArray(value) ? value : [];
    this.filas = arr.slice(0, 3);
  }
}
