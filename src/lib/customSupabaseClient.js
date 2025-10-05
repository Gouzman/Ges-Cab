import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fhuzkubnxuetakpxkwlr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodXprdWJueHVldGFrcHhrd2xyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMTE4MTEsImV4cCI6MjA3NDY4NzgxMX0.6_fLQrCtBdYAKNXgT2fAo6vHVfhe3DmISq7F-egfyUY';

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };