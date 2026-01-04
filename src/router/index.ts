import { createRouter, createWebHistory } from 'vue-router';

import Devices from '@/views/Devices.vue';
import Loans from '@/views/Loans.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'devices', component: Devices },
    { path: '/loans', name: 'loans', component: Loans },
  ],
});

export default router;
