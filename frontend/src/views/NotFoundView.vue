<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { PATHS } from "../router/paths";

const { t } = useI18n();
</script>

<template>
  <div>
    <h1>{{ t("common.notFound") }}</h1>
    <RouterLink :to="PATHS.dashboard">{{ t("common.goHome") }}</RouterLink>
  </div>
</template>
