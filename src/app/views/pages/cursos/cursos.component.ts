import { CursoModel } from './../../../Models/curso.model';
import { CursosService } from './services/cursos.service';
import { Component, OnInit } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {

  /********PROPPIEDAD PARA LA TABLA******** */
  loadingIndicator = true;
  reorderable = true;
  ColumnMode = ColumnMode;
  rows = [];
   constructor(
    private _cursosService:CursosService
  ) {


  }

  ngOnInit(): void {
      this.getCursos();
  }

  public getCursos(){
      this._cursosService.getCursos().subscribe((cursos : Array<CursoModel>)=>{
        console.log("cursos::" , cursos);

          this.rows = cursos;
      })
  }

  private _cerrar():void {

  }

  public onAgregar():void {

  }
}
