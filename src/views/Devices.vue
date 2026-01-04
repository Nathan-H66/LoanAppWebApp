<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { useDevices } from '@/composables/useDevices';
const { devices, loading, error, fetchDevices } = useDevices();
import { useAuth0 } from '@auth0/auth0-vue';
const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
import { createLoan } from '@/composables/useLoans';
// Handler for loan creation
const handleLoan = async (device: any) => {
  if (!user.value || !user.value.email) return;
  try {
    await createLoan(
      device.id,
      device.name,
      user.value.email,
      getAccessTokenSilently,
    );
    // Calculate due date 2 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 2);
    const dueDateStr = dueDate.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    alert(`Loan created! Due on ${dueDateStr}`);
  } catch (e) {
    alert('Failed to create loan.');
  }
};

// Computed property to check if user has Student or Staff role
const hasLoanAccess = computed(() => {
  if (!user.value) return false;
  const roles =
    user.value['https://yourdomain/roles'] ||
    user.value[
      'https://loanwebappdevnh66store.z33.web.core.windows.net/roles'
    ] ||
    user.value['roles'] ||
    [];
  return (
    Array.isArray(roles) &&
    (roles.includes('Student') || roles.includes('Staff'))
  );
});

onMounted(() => {
  fetchDevices();
});

watch(isAuthenticated, () => {
  // Re-fetch when auth state changes to reflect public vs private data
  fetchDevices(true);
});
</script>

<template>
  <div class="devices-view">
    <h1>Devices</h1>

    <div v-if="loading" class="loading">Loading devices...</div>
    <div v-else-if="error" class="error">
      <p>Error: {{ error }}</p>
      <button @click="fetchDevices(true)">Retry</button>
    </div>
    <div v-else-if="devices.length === 0" class="empty">No devices found.</div>

    <ul v-else class="list">
      <li v-for="p in devices" :key="p.id" class="card">
        <div class="row">
          <strong class="name">{{ p.name }}</strong>
        </div>
        <!-- Category shown under name, above description -->
        <div v-if="p.category" class="category">{{ p.category }}</div>
        <p v-if="p.description" class="desc">{{ p.description }}</p>
        <div v-if="hasLoanAccess" class="quantity">
          Quantity: {{ p.quantity ?? 'N/A' }}
        </div>
        <button
          v-if="hasLoanAccess"
          class="loan-btn"
          @click="() => handleLoan(p)"
        >
          Loan
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.products-view {
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
.price {
  color: #065f46;
  font-weight: 600;
}
.desc {
  color: #6b7280;
  margin-top: 0.5rem;
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
