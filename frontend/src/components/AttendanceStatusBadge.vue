<script setup lang="ts">
import type { AttendanceStatus } from "../types/attendance";

defineProps<{ status: AttendanceStatus; active: boolean }>();
const emit = defineEmits<{ click: [] }>();
</script>

<template>
  <button
    type="button"
    :class="['badge', status, { active }]"
    @click="emit('click')"
  >
    {{ status.charAt(0).toUpperCase() + status.slice(1) }}
  </button>
</template>

<style scoped>
.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  opacity: 0.4;
  transition: opacity 0.1s;
}

.badge.active {
  opacity: 1;
}

.badge.present {
  background: #14532d;
  color: #86efac;
  border-color: #166534;
}

.badge.absent {
  background: #450a0a;
  color: #fca5a5;
  border-color: #7f1d1d;
}

.badge.late {
  background: #422006;
  color: #fde68a;
  border-color: #78350f;
}

.badge.excused {
  background: #1e3a5f;
  color: #93c5fd;
  border-color: #1e40af;
}

@media (prefers-color-scheme: light) {
  .badge.present {
    background: #dcfce7;
    color: #15803d;
    border-color: #86efac;
  }

  .badge.absent {
    background: #fee2e2;
    color: #dc2626;
    border-color: #fca5a5;
  }

  .badge.late {
    background: #fef9c3;
    color: #b45309;
    border-color: #fde047;
  }

  .badge.excused {
    background: #dbeafe;
    color: #1d4ed8;
    border-color: #93c5fd;
  }
}
</style>
