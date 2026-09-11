import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://dxgczhkmeuejwpndksav.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Z2N6aGttZXVlandwbmRrc2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkwOTYyNDUsImV4cCI6MjEwNDY3MjI0NX0.doIOO-AaOdPBJxRlrTt4Tg27MRX59IrdagOLfsEHLzE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false
  }
});

/**
 * Synchronize newly registered user with Supabase Auth cloud
 */
export async function syncUserToSupabaseAuth(email, password, metadata = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) {
      console.warn('Supabase Auth Sync notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, supabaseUser: data.user };
  } catch (err) {
    console.warn('Supabase Auth Sync exception:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Verify credentials with Supabase Auth
 */
export async function verifyWithSupabaseAuth(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, session: data.session, user: data.user };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Trigger Supabase Password Recovery Email
 */
export async function sendSupabasePasswordRecovery(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:5000/reset-password'
    });

    if (error) {
      console.warn('Supabase recovery notice:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
