import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horario } from '../components/models/agenda.models';
import { environment } from '../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  
  private baseApiUrl = environment.apiUrl.replace('/tattoo', '/tatuagem');
  private http = inject(HttpClient);

  private getAgendaUrlForArtist(artistId: number): string {
    return `${this.baseApiUrl}/artistas/${artistId}/agenda/`;
  }

  getAgendamentosPorData(artistId: number, dataStr: string): Observable<Horario[]> {
    const apiUrl = this.getAgendaUrlForArtist(artistId);
    const params = new HttpParams().set('date', dataStr);
    return this.http.get<Horario[]>(apiUrl, { params });
  }

  // [CORREÇÃO] Adicionado parâmetro 'options' para controlar o envio do client_id
  saveAgendamento(
      artistId: number, 
      agendamento: Horario, 
      options?: { skipClientAuth?: boolean, clearClient?: boolean }
  ): Observable<Horario> {
    const apiUrl = this.getAgendaUrlForArtist(artistId);
    
    // Lógica padrão: Pega do localStorage
    let clientIdToSend = null;
    const storedId = localStorage.getItem('client_id');
    
    if (options?.clearClient) {
        clientIdToSend = null; // Força limpar o cliente (Recusar)
    } else if (options?.skipClientAuth) {
        clientIdToSend = undefined; // Não envia o campo (Manter existente / Confirmar)
    } else {
        // Comportamento padrão (Agendamento pelo Cliente)
        clientIdToSend = storedId ? parseInt(storedId, 10) : null;
    }

    const dataToSend: any = {
      data_hora: agendamento.data_hora,
      status: agendamento.status,
      nome_usuario: agendamento.nome_usuario
    };

    // Só adiciona ao payload se não for undefined
    if (clientIdToSend !== undefined) {
        dataToSend.client_id = clientIdToSend;
    }

    if (agendamento.id) {
      return this.http.put<Horario>(`${apiUrl}${agendamento.id}/`, dataToSend);
    } else {
      return this.http.post<Horario>(apiUrl, dataToSend);
    }
  }
}
