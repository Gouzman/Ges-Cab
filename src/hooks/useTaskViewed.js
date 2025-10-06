// Hook personnalisé pour gérer l'état "vu" des tâches
import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/customSupabaseClient';


export const useTaskViewed = (task, currentUser, onTaskUpdate) => {
  const hasMarkedAsViewed = useRef(false);

  useEffect(() => {
    const markTaskAsViewed = async () => {
      // Vérifications avant de marquer comme vu
      if (!task || !currentUser || hasMarkedAsViewed.current) {
        return;
      }

      // Vérifier si l'utilisateur actuel est bien l'assigné de la tâche
      const isAssignee = task.assigned_to_id === currentUser.id;
      if (!isAssignee) {
        return;
      }

      // Vérifier si la tâche n'est pas déjà vue ou terminée
      const canMarkAsViewed = task.status === 'pending';
      if (!canMarkAsViewed) {
        return;
      }

      try {
        hasMarkedAsViewed.current = true;

        // Mettre à jour le statut et la date de consultation
        const { data, error } = await supabase
          .from('tasks')
          .update({
            status: 'seen',
            seen_at: new Date().toISOString(),
            last_viewed_at: new Date().toISOString()
          })
          .eq('id', task.id)
          .select()
          .single();

        if (error) {
          console.error('Erreur lors de la mise à jour du statut:', error);
          hasMarkedAsViewed.current = false;
          return;
        }

        // Callback pour mettre à jour la tâche dans l'état parent
        if (onTaskUpdate && data) {
          onTaskUpdate(data);
        }

        // Notification silencieuse (pas de toast pour ne pas déranger l'utilisateur)
        console.log(`✅ Tâche "${task.title}" marquée comme vue`);

      } catch (err) {
        console.error('Erreur inattendue lors du marquage:', err);
        hasMarkedAsViewed.current = false;
      }
    };

    // Délai léger pour éviter les appels multiples rapides
    const timer = setTimeout(() => {
      markTaskAsViewed();
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [task?.id, currentUser?.id, task?.status]);

  return {
    isViewed: task?.status === 'seen',
    viewedAt: task?.seen_at
  };
};

export default useTaskViewed;