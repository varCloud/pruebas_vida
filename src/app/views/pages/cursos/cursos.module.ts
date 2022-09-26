import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursosRoutingModule } from './cursos-routing.module';
import { CursosComponent } from './cursos.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';


@NgModule({
  declarations: [CursosComponent],
  imports: [
    CommonModule,
    CursosRoutingModule,
    NgxDatatableModule
  ]
})
export class CursosModule { }
