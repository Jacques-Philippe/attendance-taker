<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t("common.notFound") }}</h1>
    <RouterLink to="/">{{ t("common.goHome") }}</RouterLink>
  </div>
</template>
