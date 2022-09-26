export interface Curso {

  activo: Number;
  capacidad: Number;
  costo: Number;
  descripcion: string;
  fechaAlta: string;
  horario: string;
  idCurso: Number;
  lugar: string;
  nombreCurso: string;

}

export class CursoModel implements Curso {

  activo: Number;
  capacidad: Number;
  costo: Number;
  descripcion: string;
  fechaAlta: string;
  horario: string;
  idCurso: Number;
  lugar: string;
  nombreCurso: string;

  constructor(item: any) {
    this.activo = item.activo
    this.capacidad = item.capacidad;
    this.costo = item.costo;
    this.descripcion = item.descripcion;
    this.fechaAlta = item.fechaAlta;
    this.horario = item.horario;
    this.idCurso = item.idCurso;
    this.lugar = item.lugar;
    this.nombreCurso = item.nombreCurso;

  }

  get isValidCourse() {
    return this.capacidad <= 18
  }

}
