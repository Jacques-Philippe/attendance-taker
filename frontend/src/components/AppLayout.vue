<script setup lang="ts">
import TopBar from "./TopBar.vue";
import { RouterView } from "vue-router";
</script>

<template>
  <div class="app-layout">
    <TopBar />
    <main class="app-layout-content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-layout-content {
  flex: 1;
  margin-top: 60px;
  padding: 24px;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .app-layout-content {
    margin-top: 56px;
    padding: 16px;
  }
}
</style>
