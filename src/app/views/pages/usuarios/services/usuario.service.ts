import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CONSTANTS } from './../../../../core/constants/constants'
import { retry } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  constructor(private httpClient: HttpClient) {

  }

  obtenerUsuarios(){
     return this.httpClient.get(`${CONSTANTS.API_BASE_URL}${CONSTANTS.API_USUARIOS_URL}`).pipe(retry(1))
  }
}
