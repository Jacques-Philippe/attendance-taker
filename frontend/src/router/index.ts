import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import LoginView from "../views/LoginView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/login",
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

let sessionRestored = false;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (!sessionRestored) {
    await authStore.fetchCurrentUser();
    sessionRestored = true;
  }

  if (to.name === "login" && authStore.isAuthenticated) {
    return "/dashboard";
  }

  if (to.name !== "login" && !authStore.isAuthenticated) {
    return "/login";
  }
});

export default router;
