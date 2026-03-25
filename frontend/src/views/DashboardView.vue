<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { RouterLink } from "vue-router";

const authStore = useAuthStore();
</script>

<template>
  <div class="dashboard">
    <header class="dashboard-header">
      <h1>Dashboard</h1>
    </header>
    <nav class="nav-links">
      <RouterLink to="/attendance">Take Attendance</RouterLink>
      <RouterLink to="/classes">Manage Classes</RouterLink>
      <RouterLink to="/history">Attendance History</RouterLink>
      <RouterLink to="/reports">Reports</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.dashboard-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

h1 {
  font-size: 1.25rem;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem;
}

.nav-links a {
  color: #646cff;
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-links a:hover {
  text-decoration: underline;
}
</style>
