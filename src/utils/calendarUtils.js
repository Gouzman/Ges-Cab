// Utilitaires pour la gestion des dates et heures dans l'agenda
import { parseISO, isSameDay } from 'date-fns';

/**
 * Convertit une date/heure stockée en base vers une Date JavaScript locale
 * Gère automatiquement les timestamp UTC et les strings ISO
 */
export const parseItemDate = (dateString) => {
  if (!dateString) return null;
  
  try {
    // Si c'est déjà un timestamp, utiliser directement new Date()
    if (typeof dateString === 'string' && dateString.includes('T')) {
      // Format ISO avec timezone : utiliser parseISO puis convertir en local
      const parsedDate = parseISO(dateString);
      return new Date(parsedDate.getTime());
    } else {
      // Autres formats : conversion directe
      return new Date(dateString);
    }
  } catch (error) {
    console.warn('Erreur parsing date:', dateString, error);
    return new Date(); // Fallback sur la date actuelle
  }
};

/**
 * Vérifie si un élément (tâche ou événement) correspond à un jour donné
 */
export const isItemOnDay = (item, day) => {
  if (!item || !day) return false;
  
  const dateField = item.type === 'event' ? item.start_date : item.deadline;
  if (!dateField) return false;
  
  const itemDate = parseItemDate(dateField);
  return itemDate && isSameDay(itemDate, day);
};

/**
 * Calcule la position verticale d'un élément dans la vue semaine
 * @param {Object} item - L'élément (tâche ou événement)
 * @returns {Object} - { top: number, height: number } en rem
 */
export const calculateItemPosition = (item) => {
  const dateField = item.type === 'event' ? item.start_date : item.deadline;
  if (!dateField) return { top: 0, height: 1 };
  
  const startDate = parseItemDate(dateField);
  if (!startDate) return { top: 0, height: 1 };
  
  // Position verticale basée sur l'heure (4rem par heure)
  const top = (startDate.getHours() + startDate.getMinutes() / 60) * 4;
  
  // Calculer la hauteur pour les événements avec heure de fin
  let height = 1; // Hauteur minimale (15 minutes)
  
  if (item.type === 'event' && item.end_date) {
    const endDate = parseItemDate(item.end_date);
    if (endDate && endDate > startDate) {
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      height = Math.max(1, durationHours * 4); // 4rem par heure, minimum 1rem
    }
  }
  
  return { top, height };
};

/**
 * Formate une heure pour l'affichage
 */
export const formatItemTime = (item) => {
  const dateField = item.type === 'event' ? item.start_date : item.deadline;
  if (!dateField) return '';
  
  const startDate = parseItemDate(dateField);
  if (!startDate) return '';
  
  let timeStr = startDate.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Ajouter l'heure de fin pour les événements
  if (item.type === 'event' && item.end_date) {
    const endDate = parseItemDate(item.end_date);
    if (endDate) {
      timeStr += ` - ${endDate.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  }
  
  return timeStr;
};

/**
 * Filtre les éléments pour un jour donné
 */
export const filterItemsForDay = (tasks, events, day) => {
  const dayTasks = tasks.filter(task => 
    task.deadline && isItemOnDay({ ...task, type: 'task' }, day)
  ).map(task => ({ ...task, type: 'task' }));
  
  const dayEvents = events.filter(event => 
    event.start_date && isItemOnDay({ ...event, type: 'event' }, day)
  ).map(event => ({ ...event, type: 'event' }));
  
  return [...dayTasks, ...dayEvents];
};

export default {
  parseItemDate,
  isItemOnDay,
  calculateItemPosition,
  formatItemTime,
  filterItemsForDay
};