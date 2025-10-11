import { createClient } from '@supabase/supabase-js';

// Configuration Supabase pour la production
// URL de votre instance Supabase auto-hébergée
const supabaseUrl = window.SUPABASE_CONFIG?.url || 'http://82.25.116.122:8000';
const supabaseAnonKey = window.SUPABASE_CONFIG?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);