import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// URL y publishable key de Supabase.
// La publishable/anon key es pública y está protegida por RLS.
// La secret/service_role key NUNCA va en la app.
const fallbackUrl = 'https://tu-proyecto.supabase.co';
const fallbackKey = 'tu-anon-key-aqui';

export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || fallbackUrl;
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || fallbackKey;

/** true solo si hay credenciales reales (no placeholders). */
export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) &&
  Boolean(SUPABASE_ANON_KEY) &&
  !SUPABASE_URL.includes('tu-proyecto') &&
  !SUPABASE_ANON_KEY.includes('tu-anon-key');

// En Node 20 (SSR de Expo web) no hay WebSocket nativo. El cliente de Supabase
// lo exige al construirse, aunque no usemos Realtime. En el navegador y en
// React Native sí existe, así que ahí se crea normalmente.
const hasWebSocket =
  typeof globalThis !== 'undefined' &&
  typeof (globalThis as { WebSocket?: unknown }).WebSocket !== 'undefined';

export const supabase = (
  hasWebSocket
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false, // En el MVP no usamos login
          autoRefreshToken: false,
        },
      })
    : undefined
) as SupabaseClient;
