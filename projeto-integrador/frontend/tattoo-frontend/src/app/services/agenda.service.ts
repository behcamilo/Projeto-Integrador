import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
//import { Agenda } from '../components/models/reserva.models';
import { Horario, CriarAgendaRequest, Cliente, AgendaSlot } from '../components/models/agenda.models';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})

export class AgendaService {
  private http = inject(HttpClient);/////////

  //private apiURL = environment.apiUrl;
  //private apiUrl = `${environment.apiUrl}/agenda/`;
  private apiUrl: string;
  private clienteSearchApiUrl;
  ///////constructor(private http: HttpClient) {}
  constructor(){
    this.apiUrl = `${environment.apiUrl}/agenda/`;
    let baseUrl = environment.apiUrl;
    const cleanedBaseUrl = baseUrl.replace(/\/tattoo$|\/tattoo\/$/g, '');
    this.clienteSearchApiUrl = `${cleanedBaseUrl}/tatuagem/client/search/`;
    console.log('Final API URL:', this.apiUrl);
    console.log('Final Client Search URL:', this.clienteSearchApiUrl);
  }


  getAgendasDoDia(data: string, tatuadorId: number): Observable<Horario[]> {
      return this.http.get<Horario[]>(this.apiUrl, {
          params: { data: data, tatuador: tatuadorId.toString() }
      });
  }

  getClienteIdByNome(nomeCliente: string): Observable<Cliente[]> {
      //const clienteSearchApiUrl = `${environment.clienteSearchApiUrl}/client/search`;
      return this.http.get<Cliente[]>(this.clienteSearchApiUrl, {
          params: { nome: nomeCliente }
      });
  }

  criarAgenda(reserva: CriarAgendaRequest): Observable<Horario> {
    return this.http.post<Horario>(this.apiUrl, reserva);
  }

  saveAgendamento(dataToSave: Horario): Observable<Horario> {
      if (dataToSave.id && dataToSave.id > 0) {

        const payload: Partial<Horario> = {
            status: dataToSave.status,
            cliente: dataToSave.cliente,
        };
        return this.http.patch<Horario>(`${this.apiUrl}${dataToSave.id}/`, payload);

    } else {

        const payloadPost: CriarAgendaRequest = {
            data: dataToSave.data,
            hora_inicio: dataToSave.hora_inicio,
            duracao_minutos: dataToSave.duracao_minutos,
            status: dataToSave.status,
            cliente: dataToSave.cliente,
            tatuador: dataToSave.tatuador
        };
        return this.http.post<Horario>(this.apiUrl, payloadPost);
    }
  }


}
