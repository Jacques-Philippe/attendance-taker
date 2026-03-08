<script setup lang="ts">
import { onMounted } from "vue";
import { useClassesStore } from "../stores/classes";

defineProps<{ modelValue: number | null }>();
const emit = defineEmits<{ "update:modelValue": [value: number | null] }>();

const store = useClassesStore();

onMounted(() => {
  if (!store.classes.length) store.fetchClasses();
});
</script>

<template>
  <select
    :value="modelValue"
    @change="
      emit(
        'update:modelValue',
        ($event.target as HTMLSelectElement).value
          ? Number(($event.target as HTMLSelectElement).value)
          : null,
      )
    "
  >
    <option value="">— Select a class —</option>
    <option v-for="cls in store.classes" :key="cls.id" :value="cls.id">
      {{ cls.name }} ({{ cls.period }})
    </option>
  </select>
</template>
