// Delete a loan (DELETE)
export async function deleteLoan(
  loanId: string,
  getAccessTokenSilently: (options?: any) => Promise<string | undefined>,
) {
  const url = `${appConfig.loansApiBaseUrl}/${loanId}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  try {
    const token = await getAccessTokenSilently({
      audience: 'https://loan/api', // Use your Auth0 API identifier
      scope: 'delete:loans',
    } as any);
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {}
  const res = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete loan');
  // Only try to parse JSON if there is content
  if (
    res.status !== 204 &&
    res.headers.get('content-type')?.includes('application/json')
  ) {
    return await res.json();
  }
  return null;
}
// Create a loan (POST)
export async function createLoan(
  deviceId: string,
  deviceName: string,
  user: string,
  getAccessTokenSilently: (options?: any) => Promise<string | undefined>,
) {
  const url = appConfig.loansApiBaseUrl;
  const body = JSON.stringify({ deviceId, deviceName, user });
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  try {
    const token = await getAccessTokenSilently({
      audience: 'https://loan/api',
      scope: 'create:loan',
    } as any);
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {}
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });
  if (!res.ok) throw new Error('Failed to create loan');
  return await res.json();
}
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
          const token = await getAccessTokenSilently({
            audience: 'https://loan/api',
            scope: 'read:loans',
          } as any);
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
