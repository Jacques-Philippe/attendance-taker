import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import * as authApi from "../api/auth";
import { PATHS } from "../router/paths";
import type { User } from "../types/user";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const router = useRouter();

  const isAuthenticated = computed(() => user.value !== null);

  async function login(username: string, password: string): Promise<void> {
    const response = await authApi.login({ username, password });
    user.value = response.user;
    await router.push(PATHS.dashboard);
  }

  async function logout(): Promise<void> {
    await authApi.logout();
    user.value = null;
    await router.push(PATHS.login);
  }

  async function register(username: string, password: string): Promise<void> {
    const registeredUser = await authApi.register({ username, password });
    user.value = registeredUser;
    await router.push(PATHS.dashboard);
  }

  async function fetchCurrentUser(): Promise<void> {
    try {
      user.value = await authApi.getMe();
    } catch {
      user.value = null;
    }
  }

  return { user, isAuthenticated, login, logout, register, fetchCurrentUser };
});
