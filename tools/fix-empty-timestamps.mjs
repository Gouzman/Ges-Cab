// Script pour corriger les timestamps vides dans la base de données
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://fhuzkubnxuetakpxkwlr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodXprdWJueHVldGFrcHhrd2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU2MzMyMTYsImV4cCI6MjA0MTIwOTIxNn0.SZvJrV8wyXdkBu5BCZj0TJ8ic6pQRnhKT7TPl78nGAE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const fixEmptyTimestamps = async () => {
  console.log('🔧 Correction des timestamps vides...');
  
  try {
    // Corriger les champs deadline vides
    const { data: tasksWithEmptyDeadline, error: selectError } = await supabase
      .from('tasks')
      .select('id, deadline')
      .eq('deadline', '');
    
    if (selectError) {
      console.error('Erreur lors de la sélection des tâches:', selectError);
      return;
    }
    
    console.log(`📋 Trouvé ${tasksWithEmptyDeadline?.length || 0} tâches avec deadline vide`);
    
    if (tasksWithEmptyDeadline && tasksWithEmptyDeadline.length > 0) {
      // Mettre à jour les deadlines vides avec null
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ deadline: null })
        .eq('deadline', '');
      
      if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
      } else {
        console.log('✅ Deadlines vides corrigées avec succès');
      }
    }
    
    // Corriger les champs assigned_at vides (si ils existent)
    const { data: tasksWithEmptyAssignedAt, error: selectAssignedError } = await supabase
      .from('tasks')
      .select('id, assigned_at')
      .eq('assigned_at', '');
    
    if (selectAssignedError) {
      console.error('Erreur lors de la sélection assigned_at:', selectAssignedError);
    } else {
      console.log(`📋 Trouvé ${tasksWithEmptyAssignedAt?.length || 0} tâches avec assigned_at vide`);
      
      if (tasksWithEmptyAssignedAt && tasksWithEmptyAssignedAt.length > 0) {
        const { error: updateAssignedError } = await supabase
          .from('tasks')
          .update({ assigned_at: null })
          .eq('assigned_at', '');
        
        if (updateAssignedError) {
          console.error('Erreur lors de la mise à jour assigned_at:', updateAssignedError);
        } else {
          console.log('✅ Champs assigned_at vides corrigés avec succès');
        }
      }
    }
    
    console.log('🎉 Correction terminée !');
    
  } catch (error) {
    console.error('Erreur générale:', error);
  }
};

fixEmptyTimestamps();