import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [], // ← aquí declararemos header, layout, pipes...
  imports: [
    CommonModule
  ],
  exports: [] // ← aquí exportaremos los componentes reutilizables
})
export class SharedModule { }
