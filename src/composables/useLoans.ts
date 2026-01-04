import { ref, type Ref } from 'vue';
import { appConfig } from '@/config/appConfig';
import { useAuth0 } from '@auth0/auth0-vue';

export type Loan = {
  id: string;
  deviceId: string;
  deviceName: string;
  loanStartDate: string; // Use string for JSON compatibility
  loanDueDate: string;
  user: string;
};

const LOANS_API_URL = appConfig.loansApiBaseUrl; // This should be the full endpoint

export function useLoans() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const loans: Ref<Loan[]> = ref([]);
  const loading = ref(false);
  const error: Ref<string | null> = ref(null);

  const fetchLoans = async () => {
    if (loading.value) return;
    loading.value = true;
    error.value = null;
    try {
      // Use the full endpoint directly
      const url = LOANS_API_URL;
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (isAuthenticated.value) {
        try {
          const token = await getAccessTokenSilently();
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch {}
      }
      const res = await fetch(url, { headers });
      if (!res.ok)
        throw new Error(
          `Failed to fetch loans: ${res.status} ${res.statusText}`,
        );
      const result = await res.json();
      loans.value = result.data; // Use the data array
    } catch (e: any) {
      error.value = e.message || 'Unknown error';
    } finally {
      loading.value = false;
    }
  };

  return { loans, loading, error, fetchLoans };
}
