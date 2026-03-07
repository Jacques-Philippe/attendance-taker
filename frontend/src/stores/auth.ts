import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User } from "../types/user";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  async function login(_username: string, _password: string): Promise<void> {
    // TODO Phase 2: call api/auth.ts login(), set user from response
    throw new Error("Not implemented");
  }

  async function logout(): Promise<void> {
    // TODO Phase 2: call api/auth.ts logout(), clear user
    user.value = null;
  }

  async function fetchCurrentUser(): Promise<void> {
    // TODO Phase 2: call api/auth.ts getMe(), restore session on page reload
    throw new Error("Not implemented");
  }

  return { user, isAuthenticated, login, logout, fetchCurrentUser };
});
