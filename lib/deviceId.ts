import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'app_device_id';

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Web fallback: localStorage (SecureStore is native-only)
function webGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function webSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

export async function getOrCreateDeviceId(): Promise<string> {
  if (Platform.OS === 'web') {
    let id = webGet(KEY);
    if (!id) { id = generateUUID(); webSet(KEY, id); }
    return id;
  }
  let id = await SecureStore.getItemAsync(KEY);
  if (!id) {
    id = generateUUID();
    await SecureStore.setItemAsync(KEY, id);
  }
  return id;
}
