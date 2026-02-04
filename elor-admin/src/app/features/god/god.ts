import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../services/stats.service';
import { Stats } from '../../services/stats.model';

@Component({
  selector: 'app-god',
  standalone: true,
  imports: [],
  templateUrl: './god.html'
})
export class God implements OnInit {

  alumnos = 0;
  profesores = 0;
  reunionesHoy = 0;

  constructor(private stats: StatsService) {}

  ngOnInit() {
    this.stats.getStats().subscribe((data: Stats) => {

      console.log("Datos recibidos:", data);

      this.alumnos = data.alumnos;
      this.profesores = data.profesores;
      this.reunionesHoy = data.reunionesHoy;
    });
  }
}
