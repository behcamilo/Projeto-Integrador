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

  saveAgendamento(
      artistId: number, 
      agendamento: Horario, 
      options?: { skipClientAuth?: boolean, clearClient?: boolean }
  ): Observable<Horario> {
    const apiUrl = this.getAgendaUrlForArtist(artistId);
    
    let clientIdToSend = null;
    const storedId = localStorage.getItem('client_id');
    
    if (options?.clearClient) {
        clientIdToSend = null; 
    } else if (options?.skipClientAuth) {
        clientIdToSend = undefined; 
    } else {
        clientIdToSend = storedId ? parseInt(storedId, 10) : null;
    }

    const dataToSend: any = {
      data_hora: agendamento.data_hora,
      status: agendamento.status,
      nome_usuario: agendamento.nome_usuario
    };

    // [NOVO] Inclui dados da tatuagem e duração se existirem
    if (agendamento.tatuagem_id) {
        dataToSend.tatuagem_id = agendamento.tatuagem_id;
    }
    if (agendamento.duracao_minutos) {
        dataToSend.duracao_minutos = agendamento.duracao_minutos;
    }

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