import { createClient } from '@supabase/supabase-js';

// URL y clave pública anónima de tu proyecto de Supabase
// Puedes configurar estos valores en tu archivo .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'tu-anon-key-aqui';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // En el MVP no usamos login
    autoRefreshToken: false,
  },
});
