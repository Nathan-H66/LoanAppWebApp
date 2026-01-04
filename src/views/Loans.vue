<script setup lang="ts">
import { onMounted } from 'vue';
import { useLoans, deleteLoan } from '@/composables/useLoans';
const { loans, loading, error, fetchLoans } = useLoans();
import { useAuth0 } from '@auth0/auth0-vue';
const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();

// Handler for marking a loan as returned
const handleReturnLoan = async (loanId: string) => {
  try {
    await deleteLoan(loanId, getAccessTokenSilently);
    await fetchLoans(); // Refresh list after deletion
    alert('Loan marked as returned.');
  } catch (e) {
    alert('Failed to mark loan as returned.');
  }
};

// Computed property to check if user has Staff role
import { computed } from 'vue';
const isStaff = computed(() => {
  if (!user.value) return false;
  const roles =
    user.value['https://yourdomain/roles'] ||
    user.value[
      'https://loanwebappdevnh66store.z33.web.core.windows.net/roles'
    ] ||
    user.value['roles'] ||
    [];
  return Array.isArray(roles) && roles.includes('Staff');
});

onMounted(() => {
  if (isStaff.value) fetchLoans();
});
</script>

<template>
  <div class="loans-view">
    <h1>Loans</h1>
    <div v-if="!isStaff" class="error">
      You do not have access to this page.
    </div>
    <template v-else>
      <div v-if="loading" class="loading">Loading loans...</div>
      <div v-else-if="error" class="error">
        <p>Error: {{ error }}</p>
        <button @click="fetchLoans">Retry</button>
      </div>
      <div v-else-if="loans.length === 0" class="empty">No loans found.</div>
      <ul v-else class="list">
        <li v-for="l in loans" :key="l.id" class="card">
          <div class="row">
            <strong class="name">{{ l.deviceName }}</strong>
            <span class="user">User: {{ l.user }}</span>
          </div>
          <div class="dates">
            <span>Start: {{ l.loanStartDate }}</span>
            <span>Due: {{ l.loanDueDate }}</span>
          </div>
          <button class="return-btn" @click="() => handleReturnLoan(l.id)">
            Mark as Returned
          </button>
        </li>
      </ul>
    </template>
  </div>
</template>

<style scoped>
.loans-view {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem;
}
.list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}
.card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}
.row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.name {
  color: #1f2937;
}
.user {
  color: #374151;
  font-size: 0.95em;
}
.dates {
  margin-top: 0.5rem;
  color: #6b7280;
  font-size: 0.95em;
  display: flex;
  gap: 1.5em;
}
.return-btn {
  margin-top: 1em;
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}
.return-btn:hover {
  background: #b91c1c;
}
.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
}
.error button {
  margin-top: 0.5rem;
}
</style>
