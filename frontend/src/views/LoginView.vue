<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "../stores/auth";
import { PATHS } from "../router/paths";

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push(PATHS.dashboard);
  }
});

async function handleSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await authStore.login(username.value, password.value);
  } catch {
    error.value = t("auth.login.invalidCredentials");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>{{ t("auth.appName") }}</h1>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="username">{{ t("auth.login.username") }}</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </div>
        <div class="field">
          <label for="password">{{ t("auth.login.password") }}</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? t("auth.login.submitting") : t("auth.login.submit") }}
        </button>
      </form>
      <p class="register-link">
        {{ t("auth.login.noAccount") }}
        <RouterLink :to="PATHS.register">{{
          t("auth.login.createOne")
        }}</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.login-card {
  width: 100%;
  max-width: 360px;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

h1 {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  text-align: center;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

input:focus {
  outline: 2px solid #646cff;
  outline-offset: 1px;
}

.error {
  margin: 0 0 0.75rem;
  font-size: 0.875rem;
  color: #dc2626;
}

button[type="submit"] {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.6rem;
  background-color: #646cff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
}

button[type="submit"]:hover:not(:disabled) {
  background-color: #535bf2;
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  margin-top: 1.25rem;
  font-size: 0.875rem;
  text-align: center;
}
</style>
