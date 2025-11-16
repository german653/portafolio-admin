import { createClient } from '@supabase/supabase-js';

// LA MISMA configuración que en el admin panel
const supabaseUrl = 'https://jlosjhbrocmshnrpkpef.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impsb3NqaGJyb2Ntc2hucnBrcGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNDQ4ODgsImV4cCI6MjA3ODgyMDg4OH0.RDQfMWUY7hPSVLHkKM-X5lYFwBO8MXPzuiwNkCHMET8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);