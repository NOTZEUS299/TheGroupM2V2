import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase configuration:', {
  url: supabaseUrl ? 'Set' : 'Missing',
  key: supabaseAnonKey ? 'Set' : 'Missing'
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('CRITICAL: Supabase environment variables are not set. Please configure them in .env file.');
  console.error('Missing:', {
    VITE_SUPABASE_URL: !supabaseUrl,
    VITE_SUPABASE_ANON_KEY: !supabaseAnonKey
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection test failed:', error);
  } else {
    console.log('Supabase connection test successful');
  }
}).catch((error) => {
  console.error('Supabase connection test error:', error);
});

export type User = {
  id: string;
  name: string;
  avatar_url: string;
  created_at: string;
  email?: string;
};

export type Channel = {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
};

export type Message = {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
};