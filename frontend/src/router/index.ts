import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { PATHS } from "./paths";
import LoginView from "../views/LoginView.vue";
import AppLayout from "../components/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: PATHS.login,
      name: "login",
      component: LoginView,
    },
    {
      path: PATHS.register,
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "dashboard",
          component: () => import("../views/DashboardView.vue"),
        },
        {
          path: PATHS.classes,
          name: "classes",
          component: () => import("../views/ClassManagementView.vue"),
        },
        {
          path: PATHS.attendance,
          name: "attendance",
          component: () => import("../views/TakeAttendanceView.vue"),
        },
        {
          path: PATHS.history,
          name: "history",
          component: () => import("../views/AttendanceHistoryView.vue"),
        },
        {
          path: PATHS.reports,
          name: "reports",
          component: () => import("../views/ReportsView.vue"),
        },
        {
          path: PATHS.studentRecordPattern,
          name: "student-record",
          component: () => import("../views/StudentRecordView.vue"),
        },
      ],
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

let sessionChecked = false;

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const publicRoutes = ["login", "register"];
  const isPublic = publicRoutes.includes(to.name as string);

  if (!sessionChecked) {
    await authStore.fetchCurrentUser();
    sessionChecked = true;
  }

  if (isPublic && authStore.isAuthenticated) {
    return PATHS.dashboard;
  }

  if (!isPublic && !authStore.isAuthenticated) {
    return PATHS.login;
  }
});

export default router;
