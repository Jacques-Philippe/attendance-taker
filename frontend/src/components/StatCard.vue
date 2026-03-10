<script setup lang="ts">
defineProps<{ label: string; value: string | number }>();
</script>

<template>
  <div class="stat-card">
    <span class="stat-value">{{ value }}</span>
    <span class="stat-label">{{ label }}</span>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  background: #1e1e2e;
  border: 1px solid #313244;
  min-width: 8rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #a1a1aa;
}

@media (prefers-color-scheme: light) {
  .stat-card {
    background: #f4f4f5;
    border-color: #d4d4d8;
  }

  .stat-label {
    color: #71717a;
  }
}
</style>
