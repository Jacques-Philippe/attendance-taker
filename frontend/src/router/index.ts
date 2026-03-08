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
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
    },
    {
      path: "/classes",
      name: "classes",
      component: () => import("../views/ClassManagementView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const publicRoutes = ["login", "register"];
  const isPublic = publicRoutes.includes(to.name as string);

  if (!isPublic) {
    await authStore.fetchCurrentUser();
  }

  if (isPublic && authStore.isAuthenticated) {
    return "/dashboard";
  }

  if (!isPublic && !authStore.isAuthenticated) {
    return "/login";
  }
});

export default router;
