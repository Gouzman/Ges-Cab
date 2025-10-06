import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/customSupabaseClient';
import { toast } from '@/components/ui/use-toast';
import EventForm from '@/components/EventForm';
import { filterItemsForDay } from '@/utils/calendarUtils';

    const getPriorityClass = (priority, darker = false) => {
  const opacity = darker ? '80' : '70';
  switch (priority) {
    case 'urgent':
      return `bg-red-500/${opacity} text-white`;
    case 'high':
      return `bg-orange-500/${opacity} text-white`;
    case 'medium':
      return `bg-yellow-500/${opacity} text-slate-900`;
    default:
      return `bg-green-500/${opacity} text-white`;
  }
};

const Calendar = ({ currentUser }) => {
      const [currentDate, setCurrentDate] = useState(new Date());
      const [events, setEvents] = useState([]);
      const [tasks, setTasks] = useState([]);
      const [showEventForm, setShowEventForm] = useState(false);

      const isGerantOrAssocie = currentUser && (currentUser.function === 'Gerant' || currentUser.function === 'Associe Emerite');
      const isAdmin = isGerantOrAssocie || (currentUser.role && currentUser.role.toLowerCase() === 'admin');

      const fetchData = useCallback(async () => {
        const fetchTasks = async () => {
          let query = supabase
            .from('tasks')
            .select('id, title, deadline, priority')
            .not('deadline', 'is', null);
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
          try {
            const { data, error } = await supabase
              .from('events')
              .select('*')
              .order('start_date');
            if (error) throw error;
            if (!data) return [];
          
          const userVisibleEvents = data.filter(event => {
            if (isAdmin) return true;
            return event.created_by === currentUser.id || event.attendees.includes(currentUser.id);
          });
          
          return userVisibleEvents.map(e => ({ ...e, type: 'event' }));
        } catch (error) {
          console.error('Erreur lors du chargement des événements:', error);
          toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les événements." });
          return [];
        }
        };        const [taskData, eventData] = await Promise.all([fetchTasks(), fetchEvents()]);
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
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
              <ChevronLeft className="w-6 h-6 text-primary" />
            </Button>
            <span className="text-2xl font-bold text-cabinet-text capitalize">
              {format(currentDate, dateFormat, { locale: fr })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
              <ChevronRight className="w-6 h-6 text-primary" />
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
            <div className="text-center text-sm font-medium text-muted-foreground capitalize" key={i}>
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
            const dayItems = filterItemsForDay(tasks, events, cloneDay);

            days.push(
              <div
                className={`p-2 h-32 border border-cabinet-border rounded-lg flex flex-col overflow-hidden transition-colors duration-200 ${
                  !isSameMonth(day, monthStart) ? "bg-cabinet-surface/30" : "bg-cabinet-surface/60 hover:bg-cabinet-surface/80"
                } ${isSameDay(day, new Date()) ? "border-primary" : ""}`}
                key={day.toString()}
              >
                <span className={`font-semibold ${!isSameMonth(day, monthStart) ? "text-muted-foreground/50" : "text-cabinet-text"}`}>
                  {format(day, "d")}
                </span>
                <div className="flex-grow overflow-y-auto mt-1 space-y-1 pr-1">
                  {dayItems.map(item => (
                    <div key={`${item.type}-${item.id}`} className={`px-1.5 py-0.5 text-xs rounded-md truncate ${
                      item.type === 'task' ? 
                        getPriorityClass(item.priority) :
                        'bg-purple-500/70 text-white'
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



      return (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">Agenda</h1>
                <p className="text-muted-foreground">Visualisez vos échéances et événements</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowEventForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvel Événement
                </Button>
              </div>
            </div>
            <div className="cabinet-card rounded-xl p-6">
              {renderHeader()}
              {renderDays()}
              <div className="mt-2">
                {renderMonthCells()}
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
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        function: PropTypes.string,
        role: PropTypes.string,
      }),
    };
    
    export default Calendar;