import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CentrosService, CentrosResponse } from '../../services/centros.service';
import { Centro } from '../../models/centro.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-centros-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './centros-list.component.html'
})
export class CentrosListComponent implements OnInit {
  filtros = { dtituc: 'Todos', dterre: 'Todos', dmunic: 'Todos', q: '' };
  page = 1;
  pageSize = 20;
  total = 0;
  items: Centro[] = [];
  cargando = false;

  dtitucOptions: string[] = [];
  dterreOptions: string[] = [];
  dmunicOptions: string[] = [];

  private allItems: Centro[] = [];

  constructor(
    private centrosSvc: CentrosService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.cargando = true;

    forkJoin({
      all: this.centrosSvc.getCentros({ page: 1, pageSize: 10000 }).pipe(
        catchError(() => of({ total: 0, page: 1, pageSize: 10000, items: [] } as any))
      ),
      first: this.centrosSvc.getCentros({ ...this.filtros, page: 1, pageSize: this.pageSize }).pipe(
        catchError(() => of({ total: 0, page: 1, pageSize: this.pageSize, items: [] } as any))
      )
    }).pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe(({ all, first }: any) => {
      this.allItems = (all.items || []) as Centro[];

      this.dtitucOptions = this.buildOptions(this.allItems, c => c.dtituc);
      this.dterreOptions = this.buildOptions(this.allItems, c => c.dterr);

      // Municipios iniciales 
      this.dmunicOptions = this.buildMunicipiosOptions();

      this.items = first.items || [];
      this.total = first.total || 0;
      this.page = 1;

      this.cdr.detectChanges();
    });
  }

  onTerritorioChange() {
    this.dmunicOptions = this.buildMunicipiosOptions();

    if (!this.dmunicOptions.includes(this.filtros.dmunic)) {
      this.filtros.dmunic = 'Todos';
    }

    this.cargar(1);
  }

  onTitulacionChange() {
   
    this.dmunicOptions = this.buildMunicipiosOptions();

    if (!this.dmunicOptions.includes(this.filtros.dmunic)) {
      this.filtros.dmunic = 'Todos';
    }

    this.cargar(1);
  }

  onMunicipioChange() {
    this.cargar(1);
  }

  cargar(page = 1) {
    this.cargando = true;
    this.page = page;

    this.centrosSvc.getCentros({
      ...this.filtros,
      page: this.page,
      pageSize: this.pageSize
    }).pipe(
      finalize(() => {
        this.cargando = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res: CentrosResponse) => {
        this.items = res.items || [];
        this.total = res.total || 0;
        this.cdr.detectChanges();
      },
      error: (e) => {
        console.error('[CentrosList] error', e);
      }
    });
  }

  get totalPages() {
    return Math.ceil(this.total / this.pageSize);
  }

  verDetalle(ccen: number) {
    this.router.navigate(['/centros', ccen]);
  }

  private buildOptions(all: Centro[], pick: (c: Centro) => string | null | undefined): string[] {
    const set = new Set<string>();
    for (const c of all) set.add((pick(c) || 'Otros').trim());
    return ['Todos', ...Array.from(set).sort()];
  }

  private buildMunicipiosOptions(): string[] {
    let base = this.allItems;

    // filtro por territorio
    if (this.filtros.dterre !== 'Todos') {
      base = base.filter(c => (c.dterr || '').trim() === this.filtros.dterre);
    }

    // que dependa también de titulación
    if (this.filtros.dtituc !== 'Todos') {
      base = base.filter(c => (c.dtituc || '').trim() === this.filtros.dtituc);
    }

    const set = new Set<string>();
    for (const c of base) set.add((c.dmunic || 'Otros').trim());

    return ['Todos', ...Array.from(set).sort()];
  }
}
