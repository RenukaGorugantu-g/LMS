import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://dxgczhkmeuejwpndksav.supabase.co';
const supabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2N6aGttZXVlandwbmRrc2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTYyNDUsImV4cCI6MjEwNDY3MjI0NX0.doIOO-AaOdPBJxRlrTt4Tg27MRX59IrdagOLfsEHLzE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
