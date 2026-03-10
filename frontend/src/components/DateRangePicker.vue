<script setup lang="ts">
const props = defineProps<{ modelValue: { from: string; to: string } }>();
const emit = defineEmits<{
  "update:modelValue": [value: { from: string; to: string }];
}>();

function setFrom(e: Event) {
  emit("update:modelValue", {
    from: (e.target as HTMLInputElement).value,
    to: props.modelValue.to,
  });
}

function setTo(e: Event) {
  emit("update:modelValue", {
    from: props.modelValue.from,
    to: (e.target as HTMLInputElement).value,
  });
}
</script>

<template>
  <div class="date-range-picker">
    <label class="range-field">
      <span>From</span>
      <input type="date" :value="modelValue.from" @change="setFrom" />
    </label>
    <label class="range-field">
      <span>To</span>
      <input type="date" :value="modelValue.to" @change="setTo" />
    </label>
  </div>
</template>

<style scoped>
.date-range-picker {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.range-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.range-field span {
  color: #a1a1aa;
}

input[type="date"] {
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #313244;
  background: #1e1e2e;
  color: inherit;
  font-size: 0.9rem;
}

@media (prefers-color-scheme: light) {
  .range-field span {
    color: #71717a;
  }

  input[type="date"] {
    background: #ffffff;
    border-color: #d4d4d8;
  }
}
</style>
