import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Horario } from '../models/agenda.models';
import { AgendaService } from '../../services/agenda.service';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap, throwError } from 'rxjs';
@Component({
  selector: 'app-agenda',
  standalone: true,
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

  erroDeConflito: string | null = null;
  tatuadorSelecionadoId: number = 1;

  constructor(private agendamentoService: AgendaService) { }

  ngOnInit(): void {
    this.generateCalendarDays(this.currentDate.getFullYear(), this.currentDate.getMonth());
    const today = new Date();
    this.selectDay(today);
    this.initBookingForm();
  }

  initBookingForm(): void {
    this.bookingForm = new FormGroup({
      userName: new FormControl('', Validators.required),
      reservationType: new FormControl('reservado', Validators.required)
    });
  }

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

  changeMonth(delta: number): void {
    const newMonth = this.currentDate.getMonth() + delta;
    this.currentDate.setMonth(newMonth);
    this.generateCalendarDays(this.currentDate.getFullYear(), this.currentDate.getMonth());

    const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
    this.selectDay(firstDayOfMonth);
  }

  isDaySelected(date: Date): boolean {
    if (!this.selectedDate) return false;
    return this.formatDate(date) === this.formatDate(this.selectedDate);
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

  private getSlotsBase(day: Date): Horario[] {
    const slots: Horario[] = [];
    const startHour = 9;
    const endHour = 18;
    const duration = 60; // 60 minutos

    const dateStr = day.toISOString().split('T')[0];

    for (let hour = startHour; hour < endHour; hour += (duration / 60)) {
        const hourStr = hour.toString().padStart(2, '0');
        const timeStr = `${hourStr}:00:00`;

        // CORREÇÃO: Cria o objeto Horario com os campos obrigatórios
        slots.push({
            id: 0, // ID 0 indica que o slot só existe no frontend
            data: dateStr,
            hora_inicio: timeStr,
            duracao_minutos: duration,
            status: 'disponivel',
            tatuador: this.tatuadorSelecionadoId,
            cliente: null, // Pode ser nulo
        } as Horario); // Usa 'as Horario' para garantir o tipo de retorno
    }
    return slots;
  }

  selectDay(day: Date): void {
      this.selectedDate = day;
      this.horariosDisponiveis = [];
      this.erroDeConflito = null;

      const formattedDate = day.toISOString().split('T')[0];

      let allSlots = this.getSlotsBase(day); // GERA A LISTA BASE

      this.agendamentoService.getAgendasDoDia(formattedDate, this.tatuadorSelecionadoId).subscribe({
          next: (reservedHorarios) => {

              const reservedMap = new Map<string, Horario>();
              reservedHorarios.forEach(h => {
                  reservedMap.set(h.hora_inicio, h);
              });

              // MESCLAGEM: O slot do backend (reservado/ocupado) substitui o slot base ('disponivel')
              this.horariosDisponiveis = allSlots.map(slot => {
                  const reservedSlot = reservedMap.get(slot.hora_inicio);
                  return reservedSlot ? reservedSlot : slot;
              });

              console.log("Horários Populados:", this.horariosDisponiveis);
          },
          error: (error) => {
              console.error('Erro ao carregar agenda do dia:', error);
              this.horariosDisponiveis = allSlots;
          }
      });
  }

  openBookingForm(horario: Horario): void {
    this.selectedHorario = horario;
    this.showBookingForm = true;

    // Obtém os valores atuais (se existirem, senão usa defaults)
    const currentUserName = 'Cliente Desconhecido'; // Seu código original não usa o nome de verdade
    const currentStatus = horario.status;

    this.bookingForm.setValue({
      userName: currentUserName,
      reservationType: currentStatus
    });
  }



  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }




  get currentMonthYear(): string {
    return this.currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }



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

  onSubmitBooking(): void {
    if (!this.bookingForm.valid || !this.selectedHorario) {
        return;
    }

    const { userName, reservationType } = this.bookingForm.value;
    const horarioId = this.selectedHorario.id;
    this.erroDeConflito = null;

    // 1. Inicia a pesquisa do cliente pelo nome
    this.agendamentoService.getClienteIdByNome(userName).pipe(
        // 2. switchMap: Encadeia a pesquisa de cliente com a operação de salvamento
        switchMap((clientes) => {
            if (!clientes || clientes.length === 0) {
                // Se nenhum cliente for encontrado, LANÇA um erro que será capturado no .subscribe
                return throwError(() => new Error(`Cliente com o nome "${userName}" não encontrado. Verifique a escrita.`));
            }

            // Assume o ID do primeiro cliente encontrado
            const clienteId = clientes[0].id;

            // 3. Monta o payload com o ID do cliente
            let dataToSave: Partial<Horario> = {
                id: horarioId,
                status: reservationType,
                cliente: clienteId // CRUCIAL: ID numérico
            };
            // Se for criação (ID=0), adiciona campos obrigatórios para POST
            if (horarioId === 0) {
                dataToSave = {
                    ...dataToSave,
                    data: this.selectedHorario!.data,
                    hora_inicio: this.selectedHorario!.hora_inicio,
                    duracao_minutos: this.selectedHorario!.duracao_minutos,
                    tatuador: this.tatuadorSelecionadoId,
                };
            }
            return this.agendamentoService.saveAgendamento(dataToSave as Horario);
        })
    ).subscribe({
        next: (response) => {
            console.log('Agendamento salvo/atualizado:', response);
            this.selectDay(this.selectedDate);
            this.closeBookingForm();
        },
        error: (error) => {
            if (error.message && error.message.includes("Cliente")) {
                 this.erroDeConflito = error.message;
            } else {
                 this.handleApiError(error as HttpErrorResponse);
            }
        }
    });
}

  private handleApiError(error: HttpErrorResponse): void {
      this.erroDeConflito = null;

      if (error.status === 400 && error.error) {
          const errors = error.error;

          if (errors.hora_inicio && errors.hora_inicio.length > 0) {
              this.erroDeConflito = errors.hora_inicio[0];
          } else if (errors.data && errors.data.length > 0) {
              this.erroDeConflito = errors.data[0];
          } else {
              this.erroDeConflito = 'Erro de validação nos dados. Verifique o formulário.';
          }
      } else {
          this.erroDeConflito = 'Erro de comunicação com o servidor. Tente novamente.';
      }
  }

  closeBookingForm(): void {
    this.showBookingForm = false;
    this.selectedHorario = null;
  }
}
