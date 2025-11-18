export interface Horario {
  id?: number;
  time: string;
  // [CORREÇÃO] Adicionado 'indisponivel' para evitar o erro de comparação TS2367
  status: 'disponivel' | 'reservado' | 'ocupado' | 'indisponivel';
  data_hora?: string;
  nome_usuario?: string;
}

export interface DiaAgenda {
  day: string;
  date: string;
  hours: Horario[];
}

export interface PerfilTatuador {
  name: string;
  studioName: string;
  address: string;
  email: string;
  phone: string;
  instagram: string;
  artStyle: string;
}