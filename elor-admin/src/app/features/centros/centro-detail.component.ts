import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CentrosService } from '../../services/centros.service';
import { Centro } from '../../models/centro.model';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { environment } from '../../../environment/environment'; 

@Component({
  selector: 'app-centro-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './centro-detail.component.html'
})
export class CentroDetailComponent implements OnInit, AfterViewInit {

  centro?: Centro;
  cargando = true;
  private ccen = 0;

  private viewReady = false;

  constructor(
    private route: ActivatedRoute,
    private centrosSvc: CentrosService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {

    this.route.paramMap.subscribe(params => {
      this.ccen = Number(params.get('ccen'));
      if (!this.ccen) return;

      this.cargando = true;
      this.cdr.detectChanges();

      this.centrosSvc.getCentro(this.ccen).subscribe({
        next: (c: Centro) => {
          this.centro = c;
          this.cargando = false;
          this.cdr.detectChanges();

          if (this.viewReady) this.initMap();
        },
        error: (e) => {
          console.error('[CentroDetail] error', e);
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    });
  }

  ngAfterViewInit() {
    this.viewReady = true;
    if (this.centro) this.initMap();
  }

  private initMap() {
    const el = document.getElementById('map');
    if (!el) {
      console.warn('[CentroDetail] #map no existe todavía');
      return;
    }
    if (!this.centro) return;

    const lat = Number((this.centro as any).lat);
    const lon = Number((this.centro as any).lon);

    if (!lat || !lon) {
      console.warn('Coordenadas inválidas:', this.centro);
      return;
    }

    mapboxgl.accessToken = environment.mapboxToken;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lon, lat],
      zoom: 14
    });

    new mapboxgl.Marker()
      .setLngLat([lon, lat])
      .setPopup(new mapboxgl.Popup().setText((this.centro as any).nombre))
      .addTo(map);

  }
}
