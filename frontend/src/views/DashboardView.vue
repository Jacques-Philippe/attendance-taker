<script setup lang="ts">
import { useAuthStore } from "../stores/auth";
import { RouterLink } from "vue-router";

const authStore = useAuthStore();
</script>

<template>
  <div class="dashboard">
    <nav class="nav-links">
      <RouterLink to="/attendance">Take Attendance</RouterLink>
      <RouterLink to="/classes">Manage Classes</RouterLink>
      <RouterLink to="/history">Attendance History</RouterLink>
      <RouterLink to="/reports">Reports</RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.nav-links a {
  display: block;
  padding: 2rem 1.5rem;
  background-color: #646cff;
  border: 2px solid #646cff;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.87);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  transition: all 250ms ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-links a:hover {
  background-color: #535bf2;
  border-color: #535bf2;
  color: rgba(255, 255, 255, 0.87);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(100, 108, 255, 0.3);
}

.nav-links a:focus {
  outline: 2px solid #646cff;
  outline-offset: 2px;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .dashboard {
    padding: 1.5rem 1rem;
  }

  .nav-links {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .nav-links a {
    padding: 1.5rem 1rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 1rem 0.75rem;
  }

  .nav-links a {
    padding: 1.25rem 0.75rem;
    font-size: 0.95rem;
  }
}
</style>
