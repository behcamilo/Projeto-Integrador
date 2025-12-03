import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Horario } from '../models/agenda.models';
import { AgendamentoService } from '../../services/agenda.service';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.scss']
})
export class AgendaComponent implements OnInit, OnChanges {

  @Input() artistId: number | null = null;
  @Input() isOwner: boolean = false; 
  
  // [NOVO] Inputs para quando o usuário vem do feed
  @Input() preSelectedTattooId: number | null = null;
  @Input() preSelectedDuration: number | null = null;

  currentDate = new Date();
  selectedDate!: Date;
  daysOfMonth: (Date | null)[] = [];
  horariosDisponiveis: Horario[] = [];

  showBookingForm: boolean = false;
  selectedHorario: Horario | null = null;
  bookingForm!: FormGroup;

  constructor(private agendamentoService: AgendamentoService) { }

  ngOnInit(): void {
    if (!this.artistId) {
        console.warn("AgendaComponent: artistId é necessário para carregar.");
        return; 
    }
    
    this.generateCalendarDays(this.currentDate.getFullYear(), this.currentDate.getMonth());
    const today = new Date();
    this.selectDay(today);
    this.initBookingForm();
  }

  // Recarrega se os inputs mudarem
  ngOnChanges(changes: SimpleChanges): void {
      if (changes['preSelectedTattooId'] && !changes['preSelectedTattooId'].firstChange) {
          // Pode adicionar lógica extra aqui se necessário
          console.log('Tatuagem pré-selecionada alterada:', this.preSelectedTattooId);
      }
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

  private loadHorariosDoBackend(date: Date): void {
      if (!this.artistId) return; 

      const dateStr = this.formatDate(date);
      const slotsBase = this.getSlotsBase(date);

      this.agendamentoService.getAgendamentosPorData(this.artistId, dateStr).subscribe({
          next: (agendamentosAPI: Horario[]) => {
              const agendamentosMap = new Map<string, Horario>();
              agendamentosAPI.forEach(h => {
                  if (h.time) {
                      agendamentosMap.set(h.time, h);
                  }
              });
              
              this.horariosDisponiveis = slotsBase.map(slot => {
                  const found = agendamentosMap.get(slot.time);
                  if (found) {
                      found.data_hora = slot.data_hora; 
                      if (found.status === 'indisponivel') {
                          found.status = 'ocupado'; 
                      }
                      return found;
                  }
                  return slot;
              });
          },
          error: (err) => {
              console.error('Erro ao carregar agendamentos:', err);
              this.horariosDisponiveis = slotsBase;
          }
      });
  }

  selectDay(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.loadHorariosDoBackend(date); 
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  hasAppointments(date: Date | null): boolean {
     if (!date) return false;
     if (this.selectedDate && this.formatDate(date) === this.formatDate(this.selectedDate)) {
         return this.horariosDisponiveis.filter(h => h.status !== 'disponivel').length > 0;
     }
     return this.getSlotsBase(date).length > 0;
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

  agendarHorario(horario: Horario): void {
    this.selectedHorario = horario;
    this.showBookingForm = true;

    const currentUserName = horario.nome_usuario || '';
    const currentStatus = horario.status === 'disponivel' ? 'reservado' : horario.status;
    
    // Pré-preenche nome se cliente estiver logado
    const clientName = localStorage.getItem('client_name') || '';

    this.bookingForm.setValue({
      userName: currentUserName || clientName,
      reservationType: currentStatus
    });
  }

  responderSolicitacao(aceitar: boolean): void {
      if (!this.selectedHorario || !this.artistId) return;

      const novoStatus = aceitar ? 'indisponivel' : 'disponivel'; 
      const novoNomeUsuario = aceitar ? this.selectedHorario.nome_usuario : '';

      const dataToSave: Horario = {
          id: this.selectedHorario.id,
          nome_usuario: novoNomeUsuario,
          status: novoStatus as any, 
          data_hora: this.selectedHorario.data_hora,
          time: this.selectedHorario.time
      };

      const options = aceitar 
          ? { skipClientAuth: true } 
          : { clearClient: true };   

      this.agendamentoService.saveAgendamento(this.artistId, dataToSave, options).subscribe({
          next: () => {
              alert(aceitar ? 'Agendamento confirmado!' : 'Agendamento recusado/cancelado.');
              this.selectDay(this.selectedDate); 
              this.closeBookingForm();
          },
          error: (err) => {
              console.error('Erro ao responder solicitação', err);
              alert('Erro ao atualizar. Tente novamente.');
          }
      });
  }

  onSubmitBooking(): void {
    if (this.bookingForm.valid && this.selectedHorario && this.artistId) {
      const { userName, reservationType } = this.bookingForm.value;

      let statusBackend = reservationType;
      if (reservationType === 'ocupado') statusBackend = 'indisponivel';

      const dataToSave: Horario = {
          id: this.selectedHorario.id,
          nome_usuario: userName,
          status: statusBackend, 
          data_hora: this.selectedHorario.data_hora,
          time: this.selectedHorario.time
      };

      // [NOVO] Se houver uma tatuagem pré-selecionada, anexa ao agendamento
      if (this.preSelectedTattooId && this.preSelectedDuration) {
          dataToSave.tatuagem_id = this.preSelectedTattooId;
          dataToSave.duracao_minutos = this.preSelectedDuration;
          console.log('Salvando agendamento vinculado à tatuagem:', this.preSelectedTattooId);
      }

      this.agendamentoService.saveAgendamento(this.artistId, dataToSave).subscribe({
        next: () => {
            this.selectDay(this.selectedDate);
            this.closeBookingForm();
            // Limpa a pré-seleção após agendar
            this.preSelectedTattooId = null;
            this.preSelectedDuration = null;
            alert('Agendamento solicitado com sucesso!');
        },
        error: (error) => {
            console.error('Erro ao salvar agendamento:', error);
            alert('Erro ao salvar agendamento.');
        }
      });
    }
  }

  closeBookingForm(): void {
    this.showBookingForm = false;
    this.selectedHorario = null;
    this.bookingForm.reset();
  }
}