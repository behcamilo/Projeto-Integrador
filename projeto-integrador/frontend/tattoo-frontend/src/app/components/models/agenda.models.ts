export interface AgendaSlot {
  id: number;
  data: string;          // Ex: "2024-12-31" (Corresponde a 'data' do Django)
  hora_inicio: string;   // Ex: "14:00:00" (Corresponde a 'hora_inicio' do Django)
  duracao_minutos: number; // Corresponde a 'duracao_minutos' do Django
  status: 'disponivel' | 'pendente' | 'reservado' | 'ocupado';
  cliente: number | null; // ID do cliente, se estiver agendado
  tatuador: number;       // ID do tatuador
}

export type Horario = AgendaSlot & {
  nome_usuario: string;
};

export interface CriarAgendaRequest {
  data: string;
  hora_inicio: string;
  duracao_minutos: number;
  status: 'disponivel' | 'pendente' | 'reservado' | 'ocupado';  tatuador: number;
  cliente: number | null;
}

export interface Cliente {
    id: number;
    nome: string;
}
