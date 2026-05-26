import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { mockBackend } from './mockBackend';
import { supabaseBackend } from './supabaseBackend';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

// Toggle this to switch between Mock, Base44, or Supabase
// In production, this can be controlled via environment variables
const USE_MOCK = true; 
const USE_SUPABASE = false;

let client;

if (USE_MOCK) {
  client = mockBackend;
} else if (USE_SUPABASE) {
  client = supabaseBackend;
} else {
  // Original Base44 SDK implementation
  client = createClient({
    appId,
    token,
    functionsVersion,
    serverUrl: '',
    requiresAuth: false,
    appBaseUrl
  });
}

export const isMock = USE_MOCK;
export const base44 = client;
export default client;
