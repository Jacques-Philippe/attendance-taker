<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')

function handleSubmit() {
  // TODO Phase 2: wire up auth store login action
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Attendance Taker</h1>
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
            autocomplete="current-password"
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
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

button[type='submit'] {
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

button[type='submit']:hover {
  background-color: #535bf2;
}
</style>
