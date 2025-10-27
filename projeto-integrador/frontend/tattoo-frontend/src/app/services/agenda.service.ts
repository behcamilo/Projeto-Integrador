import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Horario } from '../components/models/agenda.models';

@Injectable({ providedIn: 'root' })
export class AgendamentoService {
  private apiUrl = 'http://localhost:8000/api/agendamentos/';

  constructor(private http: HttpClient) { }

  getAgendamentosPorData(dataStr: string): Observable<Horario[]> {
    const params = new HttpParams().set('date', dataStr);
    return this.http.get<Horario[]>(this.apiUrl, { params });
  }

  saveAgendamento(agendamento: Horario): Observable<Horario> {
    const dataToSend = {
      data_hora: agendamento.data_hora,
      status: agendamento.status,
      nome_usuario: agendamento.nome_usuario
    };
    if (agendamento.id) {
      return this.http.put<Horario>(`${this.apiUrl}${agendamento.id}/`, dataToSend);
    } else {
      return this.http.post<Horario>(this.apiUrl, dataToSend);
    }
  }
}
