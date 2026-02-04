import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mini-reuniones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mini-reuniones.component.html'
})
export class MiniReunionesComponent {

  reuniones: any[] = [];

  @Input()
  set datos(value: any[] | null | undefined) {
    const arr = Array.isArray(value) ? value : [];
    this.reuniones = [...arr];
  }

  formatearFecha(fechaCompleta: any): string {
    if (!fechaCompleta) return '-';
    const d = new Date(fechaCompleta);
    if (isNaN(d.getTime())) return '-';
    try {
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '-';
    }
  }

  formatearHora(fechaCompleta: any): string {
    if (!fechaCompleta) return '-';
    const d = new Date(fechaCompleta);
    if (isNaN(d.getTime())) return '-';
    try {
      return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '-';
    }
  }

  getEstadoClase(estado: any): string {
    switch (String(estado ?? '').toLowerCase()) {
      case 'pendiente': return 'bg-warning text-dark';
      case 'aceptada': return 'bg-success text-white';
      case 'denegada': return 'bg-danger text-white';
      case 'conflicto': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }
}
