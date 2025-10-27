export interface Horario {
  id?: number;
  time: string;
  status: 'disponivel' | 'reservado' | 'ocupado';
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
