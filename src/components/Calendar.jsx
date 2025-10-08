import React, { useState, useEffect, useCallback } from 'react';
    import PropTypes from 'prop-types';
    import { motion } from 'framer-motion';
    import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
    import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, addWeeks, subWeeks, eachDayOfInterval, setHours } from 'date-fns';
    import { fr } from 'date-fns/locale';
    import { Button } from '@/components/ui/button';
    import { supabase } from '@/lib/customSupabaseClient';
    import { toast } from '@/components/ui/use-toast';
    import EventForm from '@/components/EventForm';

    // Fonctions utilitaires pour éviter les ternaires imbriqués
    const getTaskPriorityStyle = (priority) => {
      switch (priority) {
        case 'urgent':
          return 'bg-red-500/70 text-white';
        case 'high':
          return 'bg-orange-500/70 text-white';
        case 'medium':
          return 'bg-yellow-500/70 text-slate-900';
        default:
          return 'bg-green-500/70 text-white';
      }
    };

    const getTaskPriorityStyleWeek = (priority) => {
      switch (priority) {
        case 'urgent':
          return 'bg-red-500/80 text-white';
        case 'high':
          return 'bg-orange-500/80 text-white';
        case 'medium':
          return 'bg-yellow-500/80 text-slate-900';
        default:
          return 'bg-green-500/80 text-white';
      }
    };

    const Calendar = ({ currentUser }) => {
      const [currentDate, setCurrentDate] = useState(new Date());
      const [view, setView] = useState('month'); // 'month' or 'week'
      const [events, setEvents] = useState([]);
      const [tasks, setTasks] = useState([]);
      const [showEventForm, setShowEventForm] = useState(false);

      const isGerantOrAssocie = currentUser && (currentUser.function === 'Gerant' || currentUser.function === 'Associe Emerite');
      const isAdmin = isGerantOrAssocie || (currentUser.role && currentUser.role.toLowerCase() === 'admin');

      const fetchData = useCallback(async () => {
        const fetchTasks = async () => {
          let query = supabase.from('tasks').select('id, title, deadline, priority').not('deadline', 'is', null);
          if (!isAdmin) {
            query = query.eq('assigned_to_id', currentUser.id);
          }
          const { data, error } = await query;
          if (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les tâches." });
            return [];
          }
          return data.map(t => ({ ...t, type: 'task' }));
        };

        const fetchEvents = async () => {
          let query = supabase.from('events').select('*');
          const { data, error } = await query;
          if (error) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les événements." });
            return [];
          }
          
          const userVisibleEvents = data.filter(event => {
            if (isAdmin) return true;
            if (event.created_by === currentUser.id) return true;
            return event.attendees?.includes(currentUser.id);
          });

          return userVisibleEvents.map(e => ({ ...e, type: 'event', deadline: e.start_date }));
        };

        const [taskData, eventData] = await Promise.all([fetchTasks(), fetchEvents()]);
        setTasks(taskData);
        setEvents(eventData);
      }, [currentUser, isAdmin]);

      useEffect(() => {
        fetchData();
      }, [currentDate, fetchData]);

      const handleEventCreated = () => {
        setShowEventForm(false);
        fetchData();
      };

      const renderHeader = () => {
        const dateFormat = "MMMM yyyy";
        return (
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" size="icon" onClick={() => view === 'month' ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(subWeeks(currentDate, 1))}>
              <ChevronLeft className="w-6 h-6 text-slate-300" />
            </Button>
            <span className="text-2xl font-bold text-white capitalize">
              {format(currentDate, dateFormat, { locale: fr })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => view === 'month' ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1))}>
              <ChevronRight className="w-6 h-6 text-slate-300" />
            </Button>
          </div>
        );
      };

      const renderDays = () => {
        const days = [];
        const dateFormat = "EEEE";
        const startDate = startOfWeek(currentDate, { locale: fr });
        for (let i = 0; i < 7; i++) {
          days.push(
            <div className="text-center text-sm font-medium text-slate-400 capitalize" key={i}>
              {format(addDays(startDate, i), dateFormat, { locale: fr })}
            </div>
          );
        }
        return <div className="grid grid-cols-7 gap-2">{days}</div>;
      };

      const renderMonthCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart, { locale: fr });
        const endDate = endOfWeek(monthEnd, { locale: fr });

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
          for (let i = 0; i < 7; i++) {
            const cloneDay = day;
            const dayItems = [...tasks, ...events].filter(item => isSameDay(parseISO(item.deadline), cloneDay));

            days.push(
              <div
                className={`p-2 h-32 border border-slate-700/50 rounded-lg flex flex-col overflow-hidden transition-colors duration-200 ${
                  !isSameMonth(day, monthStart) ? "bg-slate-800/30" : "bg-slate-800/60 hover:bg-slate-700/50"
                } ${isSameDay(day, new Date()) ? "border-blue-500" : ""}`}
                key={day.toString()}
              >
                <span className={`font-semibold ${!isSameMonth(day, monthStart) ? "text-slate-600" : "text-slate-300"}`}>
                  {format(day, "d")}
                </span>
                <div className="flex-grow overflow-y-auto mt-1 space-y-1 pr-1">
                  {dayItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className={`px-1.5 py-0.5 text-xs rounded-md truncate ${
                      item.type === 'task' ? getTaskPriorityStyle(item.priority) : 'bg-purple-500/70 text-white'
                    }`}>
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>
            );
            day = addDays(day, 1);
          }
          rows.push(<div className="grid grid-cols-7 gap-2" key={day.toString()}>{days}</div>);
          days = [];
        }
        return <div className="space-y-2">{rows}</div>;
      };

      const renderWeekView = () => {
        const weekDays = eachDayOfInterval({
          start: startOfWeek(currentDate, { locale: fr }),
          end: endOfWeek(currentDate, { locale: fr }),
        });
        const hours = Array.from({ length: 24 }, (_, i) => i); // 00h to 23h

        return (
          <div className="flex">
            <div className="flex flex-col">
              <div className="h-16"></div>
              {hours.map(hour => (
                <div key={hour} className="h-16 flex items-center justify-center text-xs text-slate-400 pr-2">
                  {format(setHours(new Date(), hour), 'HH:mm')}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map(day => (
                <div key={day.toString()} className="flex flex-col border-l border-slate-700/50">
                  <div className={`h-16 text-center p-2 ${isSameDay(day, new Date()) ? 'text-blue-400' : 'text-slate-300'}`}>
                    <p className="font-semibold text-lg">{format(day, 'd')}</p>
                    <p className="text-xs capitalize">{format(day, 'EEE', { locale: fr })}</p>
                  </div>
                  <div className="relative flex-1">
                    {hours.map(hour => (
                      <div key={hour} className="h-16 border-t border-slate-700/50"></div>
                    ))}
                    {[...tasks, ...events]
                      .filter(item => isSameDay(parseISO(item.deadline), day))
                      .map(item => {
                        const itemDate = parseISO(item.deadline);
                        const top = (itemDate.getHours() + itemDate.getMinutes() / 60) * 4; // 4rem (h-16) per hour
                        
                        return (
                          <div
                            key={`${item.type}-${item.id}`}
                            className={`absolute w-full p-1 text-xs rounded-md truncate z-10 ${
                              item.type === 'task' ? getTaskPriorityStyleWeek(item.priority) : 'bg-purple-500/80 text-white'
                            }`}
                            style={{ top: `${top}rem` }}
                          >
                            {item.title}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      };

      return (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Agenda</h1>
                <p className="text-slate-400">Visualisez vos échéances et événements</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-slate-700/50 p-1 rounded-lg flex gap-1">
                  <Button size="sm" variant={view === 'week' ? 'secondary' : 'ghost'} onClick={() => setView('week')}>Semaine</Button>
                  <Button size="sm" variant={view === 'month' ? 'secondary' : 'ghost'} onClick={() => setView('month')}>Mois</Button>
                </div>
                <Button 
                  onClick={() => setShowEventForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Événement
                </Button>
              </div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
              {renderHeader()}
              {view === 'month' && renderDays()}
              <div className="mt-2">
                {view === 'month' ? renderMonthCells() : renderWeekView()}
              </div>
            </div>
          </motion.div>
          {showEventForm && (
            <EventForm 
              currentUser={currentUser}
              onCancel={() => setShowEventForm(false)}
              onEventCreated={handleEventCreated}
            />
          )}
        </>
      );
    };

    Calendar.propTypes = {
      currentUser: PropTypes.shape({
        id: PropTypes.string.isRequired,
        function: PropTypes.string,
        role: PropTypes.string
      }).isRequired
    };

    export default Calendar;