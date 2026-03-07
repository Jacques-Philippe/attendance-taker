<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const username = ref("");
const password = ref("");
const confirmPassword = ref("");
const error = ref("");
const loading = ref(false);

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push("/dashboard");
  }
});

async function handleSubmit() {
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }
  error.value = "";
  loading.value = true;
  try {
    await authStore.register(username.value, password.value);
  } catch (e: unknown) {
    const res = (
      e as {
        response?: {
          status?: number;
          data?: { detail?: Array<{ msg: string }> | string };
        };
      }
    )?.response;
    if (res?.status === 409) {
      error.value = "Username is already taken.";
    } else if (res?.status === 422 && Array.isArray(res.data?.detail)) {
      error.value = res.data.detail.map((d) => d.msg).join(" ");
    } else {
      error.value = "Registration failed. Please try again.";
    }
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <h1>Create Account</h1>
      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </div>
        <div class="field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
          />
        </div>
        <div class="field">
          <label for="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
          />
        </div>
        <p v-if="error" class="error">{{ error }}</p>
        <button type="submit" :disabled="loading">
          {{ loading ? "Creating account…" : "Create Account" }}
        </button>
      </form>
      <p class="login-link">
        Already have an account? <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.register-card {
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

.login-link {
  margin-top: 1.25rem;
  font-size: 0.875rem;
  text-align: center;
}
</style>
