import { ref, type Ref } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';

export type Device = {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity?: number;
};

const API_BASE = appConfig.apiBaseUrl;

export function useDevices() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const devices: Ref<Device[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const fetchDevices = async (
    force = false,
    maxRetries = 3,
    retryDelay = 1000,
  ) => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        const url = new URL('devices', API_BASE).toString();
        const headers: Record<string, string> = { Accept: 'application/json' };
        if (isAuthenticated.value) {
          try {
            const token = await getAccessTokenSilently();
            if (token) headers.Authorization = `Bearer ${token}`;
          } catch {
            // If token retrieval fails, proceed unauthenticated
          }
        }
        const res = await fetch(url, { headers });
        if (!res.ok)
          throw new Error(
            `Failed to fetch devices: ${res.status} ${res.statusText}`,
          );
        const data: Device[] = await res.json();
        devices.value = Array.isArray(data) ? data : [];
        loading.value = false;
        return;
      } catch (e) {
        attempt++;
        if (attempt >= maxRetries) {
          error.value = e instanceof Error ? e.message : 'Unknown error';
          loading.value = false;
          return;
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  };

  return { devices, loading, error, fetchDevices };
}
