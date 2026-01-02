<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useDevices } from '@/composables/useDevices';
const { devices, loading, error, fetchDevices } = useDevices();
import { useAuth0 } from '@auth0/auth0-vue';
const { isAuthenticated } = useAuth0();

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
      </li>
    </ul>
    <!-- (CSS removed from template) -->
  </div>
</template>
