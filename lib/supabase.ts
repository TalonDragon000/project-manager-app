import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Mutable device ID header — set once during app init via setDeviceId()
const deviceHeaders: Record<string, string> = {};

export function setDeviceId(id: string) {
  deviceHeaders['x-device-id'] = id;
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  global: {
    // headers() is called per-request, so it picks up the device ID
    // after setDeviceId() has been called during app initialization.
    headers: deviceHeaders,
  },
});
