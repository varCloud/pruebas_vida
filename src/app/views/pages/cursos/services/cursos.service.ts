import { CursoModel } from './../../../../Models/curso.model';
import { retry, map } from 'rxjs/operators';
import { CONSTANTS } from './../../../../core/constants/constants';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CursosService {

  constructor(private _httpClient: HttpClient) {
  }
  //stream ------ ------ ------------------ -------------- ------------------- ----------- ------------ ----------
  public getCursos() {
    return this._httpClient.get(`${CONSTANTS.API_BASE_URL}${CONSTANTS.API_CURSOS_URL}`)
      .pipe(
        retry(1)
        , map((data: any) => {
          let cursos: Array<CursoModel> = new Array<CursoModel>()
          data.forEach(element => {
            cursos.push(new CursoModel(element))
          });
          return cursos;
        })

      )
  }
}
