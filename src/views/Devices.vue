<script setup lang="ts">
import { onMounted, watch, computed } from 'vue';
import { useDevices } from '@/composables/useDevices';
const { devices, loading, error, fetchDevices } = useDevices();
import { useAuth0 } from '@auth0/auth0-vue';
const { isAuthenticated, user } = useAuth0();

// Check if user has Student role
const isStudent = computed(() => {
  if (!isAuthenticated.value || !user.value) return false;
  // Auth0 roles may be in user["https://YOUR_DOMAIN/roles"] or user.roles
  const roles =
    user.value['https://loanapp-dev-nh66.uk.auth0.com/roles'] ||
    user.value.roles ||
    [];
  return Array.isArray(roles) && roles.includes('Student');
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
        <div v-if="p.category" class="category">{{ p.category }}</div>
        <p v-if="p.description" class="desc">{{ p.description }}</p>
        <!-- Show quantity and Loan button only for authenticated Student role -->
        <template v-if="isAuthenticated && isStudent">
          <div class="quantity">Quantity: {{ p.quantity ?? 'N/A' }}</div>
          <button class="loan-btn">Loan</button>
        </template>
      </li>
    </ul>
    .quantity { margin-top: 0.5rem; color: #2563eb; font-weight: 500; }
    .loan-btn { margin-top: 0.5rem; background: #2563eb; color: white; border:
    none; border-radius: 4px; padding: 0.5rem 1rem; cursor: pointer;
    font-weight: 600; transition: background 0.2s; } .loan-btn:hover {
    background: #1d4ed8; }
  </div>
</template>

<style scoped>
.devices-view {
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
.category {
  color: #374151; /* slightly darker than desc */
  font-size: 0.95rem;
  margin-top: 0.25rem;
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
