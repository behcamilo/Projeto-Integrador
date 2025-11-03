import { Time } from "@angular/common";

export interface Agenda {
  id?: number;

  data: string;
  hora_inicio: string;
  duracao_minutos: number;
  tatuador: number;

  cliente?: number;
  status?: string;
  criado_em?: string;
  horario_fim?: string;
}

export interface CriarAgendaRequest {
  data: string;
  hora_inicio: string;
  duracao_minutos: number;
  tatuador: number;
}
