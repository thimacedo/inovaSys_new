import React, { useState, useMemo } from 'react';
import { useCalendarEvents, useCreateEvent } from '../presentation/hooks/useCalendar';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import { calendarService } from '../services/calendarService';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Video,
  Plus,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';

export default function CalendarView() {
  const currentUser = useAuthStore(state => state.currentUser);
  const [currentDate, setCurrentDate] = useState(new Date());
  const { showModal, showToast } = useModal();
  const createEvent = useCreateEvent();

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const { data: events = [], isLoading } = useCalendarEvents(
    currentUser?.camara_id || undefined,
    startOfMonth.toISOString(),
    endOfMonth.toISOString()
  );

  const daysInMonth = useMemo(() => {
    const days = [];
    const firstDayOfWeek = startOfMonth.getDay();
    
    // Fill previous month days
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ day: null, date: null });
    }
    
    // Fill current month days
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      days.push({ day: i, date });
    }
    
    return days;
  }, [currentDate]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
      const eventDate = new Date(e.data_inicio);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleAddEvent = () => {
    let titulo = '';
    let data = '';
    let tipo = 'Audiencia';

    showModal(
      "Novo Compromisso",
      <div className="space-y-4 p-2">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título do Evento</label>
          <input 
            type="text" 
            placeholder="Ex: Audiência de Instrução"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            onChange={(e) => { titulo = e.target.value; }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data e Hora</label>
            <input 
              type="datetime-local"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => { data = e.target.value; }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
              onChange={(e) => { tipo = e.target.value; }}
            >
              <option value="Audiencia">Audiência</option>
              <option value="Reuniao">Reunião</option>
              <option value="Prazo">Prazo Processual</option>
            </select>
          </div>
        </div>
        <button 
          onClick={async () => {
            if (!titulo || !data) {
              showToast("Preencha o título e a data", "error");
              return;
            }
            try {
              await createEvent.mutateAsync({
                titulo,
                data_inicio: new Date(data).toISOString(),
                tipo,
                camara_id: currentUser?.camara_id
              });
              showToast("Evento criado com sucesso!");
            } catch (err) {
              showToast("Erro ao criar evento", "error");
            }
          }}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          Agendar Agora
        </button>
      </div>
    );
  };

  const showEventDetails = (event: any) => {
    showModal(
      "Detalhes do Evento",
      <div className="space-y-6 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${event.tipo === 'Audiencia' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              <CalendarIcon size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">{event.titulo}</h4>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{event.tipo}</span>
            </div>
          </div>

          <a 
            href={calendarService.generateGoogleLink(event.titulo, event.data_inicio, event.descricao || 'Compromisso InovaSys')} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold uppercase tracking-wider group"
            title="Adicionar ao Google Calendar"
          >
            <ExternalLink size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
            Google Link
          </a>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Clock size={18} className="text-slate-400" />
            <span className="text-sm font-bold">
              {new Date(event.data_inicio).toLocaleDateString('pt-BR')} às {new Date(event.data_inicio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          {event.local && (
            <div className="flex items-center gap-3 text-slate-600">
              <MapPin size={18} className="text-slate-400" />
              <span className="text-sm font-medium">{event.local}</span>
            </div>
          )}
          {event.link_reuniao && (
            <div className="flex items-center gap-3 text-blue-600">
              <Video size={18} />
              <a href={event.link_reuniao} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:underline">Entrar na Reunião Online</a>
            </div>
          )}
        </div>

        {event.descricao && (
          <div className="p-4 border border-slate-100 rounded-xl">
            <p className="text-sm text-slate-600 italic leading-relaxed">{event.descricao}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-blue-600" size={32} />
            AGENDA DA CÂMARA
          </h2>
          <p className="text-slate-500 font-medium capitalize">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddEvent}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={16} />
            Novo Evento
          </button>
          <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all"><ChevronLeft size={20} /></button>
            <div className="h-4 w-px bg-slate-100 mx-1"></div>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-900 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        {/* Calendar Header */}
        <div className="grid grid-cols-7 bg-slate-50/50 border-b border-slate-100">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
            <div key={d} className="py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-100">
          {isLoading ? (
            <div className="col-span-7 py-48 flex flex-col items-center gap-4 bg-white">
               <div className="w-10 h-10 border-4 border-slate-50 border-t-blue-600 rounded-full animate-spin"></div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizando compromissos...</p>
            </div>
          ) : daysInMonth.map((dayObj, idx) => {
            const dayEvents = dayObj.day ? getEventsForDay(dayObj.day) : [];
            const isToday = dayObj.date?.toDateString() === new Date().toDateString();

            return (
              <div key={idx} className={`min-h-[120px] bg-white p-3 transition-colors ${dayObj.day ? 'hover:bg-slate-50/50' : 'bg-slate-50/20'}`}>
                {dayObj.day && (
                  <div className="space-y-2">
                    <span className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-black ${isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
                      {dayObj.day}
                    </span>
                    <div className="space-y-1">
                      {dayEvents.map(event => (
                        <button 
                          key={event.id}
                          onClick={() => showEventDetails(event)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold truncate transition-all hover:scale-[1.02] active:scale-95 shadow-sm border ${
                            event.tipo === 'Audiencia' 
                              ? 'bg-red-50 text-red-700 border-red-100' 
                              : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}
                        >
                          {event.titulo}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
