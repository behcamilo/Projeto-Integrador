// src/app/agenda/agenda.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// [NOVO] Imports necessários para o formulário
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Horario } from '../models/agenda.models'; // Assumindo que a interface foi atualizada
import { AgendamentoService } from '../../services/agenda.service';// <--- O serviço que você precisa criar

@Component({
  selector: 'app-agenda',
  standalone: true,
  // [MODIFICADO] Adiciona ReactiveFormsModule
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit {

  currentDate = new Date();
  selectedDate!: Date;
  daysOfMonth: (Date | null)[] = [];
  horariosDisponiveis: Horario[] = [];

  // Propriedades do formulário/modal
  showBookingForm: boolean = false;
  selectedHorario: Horario | null = null;
  bookingForm!: FormGroup;

  // [CORRIGIDO] O constructor agora injeta o serviço e NADA MAIS.
  constructor(private agendamentoService: AgendamentoService) { }

  // [CORRIGIDO] O ngOnInit agora está no lugar certo
  ngOnInit(): void {
    this.generateCalendarDays(this.currentDate.getFullYear(), this.currentDate.getMonth());
    const today = new Date();
    this.selectDay(today);
    this.initBookingForm();
  }

  // [CORRIGIDO] Função de inicialização do formulário
  initBookingForm(): void {
    this.bookingForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      reservationType: new FormControl('reservado', Validators.required)
    });
  }

  // [CORRIGIDO] Função original de geração de dias
  generateCalendarDays(year: number, month: number): void {
    this.daysOfMonth = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay();

    const daysToShift = startDayOfWeek;

    for (let i = 0; i < daysToShift; i++) {
      this.daysOfMonth.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      this.daysOfMonth.push(new Date(year, month, i));
    }
  }

  // [NOVO/MODIFICADO] Cria APENAS os slots base (todos 'disponivel')
  private getSlotsBase(date: Date): Horario[] {
    const dayOfWeek = date.getDay();
    const workHours: string[] = [
        '09:00', '10:00', '11:00', '13:00',
        '14:00', '15:00', '16:00', '17:00'
    ];

    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return [];
    }

    const dateStr = this.formatDate(date);

    return workHours.map((time) => {
        return {
          time,
          status: 'disponivel',
          data_hora: `${dateStr}T${time}:00Z`,
          nome_usuario: undefined,
          id: undefined
        } as Horario;
    });
  }

  // [NOVO] Carrega os agendamentos reais do backend e funde com os slots base
  private loadHorariosDoBackend(date: Date): void {
      const dateStr = this.formatDate(date);
      const slotsBase = this.getSlotsBase(date);

      this.agendamentoService.getAgendamentosPorData(dateStr).subscribe({
          next: (agendamentosAPI: Horario[]) => {
              const agendamentosMap = new Map<string, Horario>();
              agendamentosAPI.forEach(h => {
                  // Usa o campo 'time' que o serializador do Django deve fornecer
                  if (h.time) {
                      agendamentosMap.set(h.time, h);
                  }
              });

              // Combina: se a API retornou um agendamento para o slot, use-o; senão, use o slot base 'disponível'.
              this.horariosDisponiveis = slotsBase.map(slot => {
                  return agendamentosMap.get(slot.time) || slot;
              });
          },
          error: (err) => {
              console.error('Erro ao carregar agendamentos:', err);
              // Em caso de falha na API, exibe apenas os slots vazios
              this.horariosDisponiveis = slotsBase;
          }
      });
  }


  // [MODIFICADO] selectDay
  selectDay(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.loadHorariosDoBackend(date); // Chama a API
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // [MODIFICADO] hasAppointments (Manteve a borda amarela)
  // Nota: Para verificar APENAS dias com agendamento (borda amarela) sem carregar todos os dados,
  // o ideal seria uma API separada /api/has_appointments?month=YYYY-MM.
  // No momento, usamos a lista de slots base para cobrir os dias úteis.
  hasAppointments(date: Date | null): boolean {
     if (!date) return false;

     // 1. Verifica se o dia atual selecionado (e carregado) tem agendamentos
     if (this.selectedDate && this.formatDate(date) === this.formatDate(this.selectedDate)) {
         return this.horariosDisponiveis.filter(h => h.status !== 'disponivel').length > 0;
     }

     // 2. Para manter a borda amarela em todos os dias úteis (como antes da simulação):
     return this.getSlotsBase(date).length > 0;

     // Se você quiser a borda amarela SOMENTE nos dias com agendamentos REAIS,
     // você terá que remover o item 2 e criar a API de consulta por mês.
  }

  changeMonth(delta: number): void {
    const newMonth = this.currentDate.getMonth() + delta;
    this.currentDate.setMonth(newMonth);
    this.generateCalendarDays(this.currentDate.getFullYear(), this.currentDate.getMonth());

    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    this.selectDay(firstDayOfMonth);
  }

  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }

  isDaySelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return this.formatDate(date) === this.formatDate(this.selectedDate);
  }

  // [CORRIGIDO] agendarHorario (apenas reposicionada)
  agendarHorario(horario: Horario): void {
    this.selectedHorario = horario;
    this.showBookingForm = true;

    const currentUserName = horario.nome_usuario || '';
    const currentStatus = horario.status === 'disponivel' ? 'reservado' : horario.status;

    this.bookingForm.setValue({
      userName: currentUserName,
      reservationType: currentStatus
    });
  }

  // [MODIFICADO] onSubmitBooking (agora chama o serviço)
  onSubmitBooking(): void {
    if (this.bookingForm.valid && this.selectedHorario) {
      const { userName, reservationType } = this.bookingForm.value;

      const dataToSave: Horario = {
          id: this.selectedHorario.id,
          nome_usuario: userName,
          status: reservationType,
          data_hora: this.selectedHorario.data_hora,
          time: this.selectedHorario.time
      };

      // Chamada real à API
      this.agendamentoService.saveAgendamento(dataToSave).subscribe({
        next: (response) => {
            console.log('Agendamento salvo/atualizado:', response);
            // Recarrega os dados do dia, o que garante que a UI reflita a mudança
            this.selectDay(this.selectedDate);
            this.closeBookingForm();
        },
        error: (error) => {
            console.error('Erro ao salvar agendamento:', error);
            // Mostrar erro na UI (ex: slot já ocupado, falha de CORS, etc.)
            alert('Erro ao salvar agendamento. Verifique se o backend está acessível.');
        }
      });
    }
  }

  // [CORRIGIDO] closeBookingForm (apenas reposicionada)
  closeBookingForm(): void {
    this.showBookingForm = false;
    this.selectedHorario = null;
    this.bookingForm.reset();
  }
}
