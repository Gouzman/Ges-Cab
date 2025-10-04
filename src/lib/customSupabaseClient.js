import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zaqpgcuvnsmacjfzbhea.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InphcXBnY3V2bnNtYWNqZnpiaGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzOTA4OTQsImV4cCI6MjA3Mzk2Njg5NH0.4hzxzz396UqL50NR_cmM0D8qEIUA_7iRCg9BCYAlJsM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);