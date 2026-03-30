import { createRouter, createMemoryHistory } from "vue-router";
import { createI18n } from "vue-i18n";
import type { Component } from "vue";
import en from "@/i18n/locales/en.json";
import fr from "@/i18n/locales/fr.json";
import cs from "@/i18n/locales/cs.json";
import { PATHS } from "@/router/paths";

const stub = { template: "<div />" };

export const TEST_LOCALES = { en, fr, cs };

/**
 * Creates a fresh vue-i18n instance for use in unit tests.
 * Defaults to English. Pass `locale` and/or `messages` to override.
 */
export function makeI18n(opts?: {
  locale?: string;
  messages?: Record<string, unknown>;
}) {
  return createI18n({
    legacy: false,
    locale: opts?.locale ?? "en",
    messages: opts?.messages ?? TEST_LOCALES,
  });
}

/**
 * Creates a fresh in-memory router for use in unit tests.
 * Pass `{ path, component }` to place the component under test on its real
 * route; all other routes use a stub so RouterLink and router.push don't warn.
 * Call inside each test (or beforeEach) so router state doesn't leak.
 */
export function makeRouter(current?: { path: string; component: Component }) {
  const resolve = (path: string) =>
    current?.path === path ? current.component : stub;

  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: PATHS.login, name: "login", component: resolve(PATHS.login) },
      {
        path: PATHS.register,
        name: "register",
        component: resolve(PATHS.register),
      },
      {
        path: PATHS.dashboard,
        name: "dashboard",
        component: resolve(PATHS.dashboard),
      },
      {
        path: PATHS.classes,
        name: "classes",
        component: resolve(PATHS.classes),
      },
      {
        path: PATHS.attendance,
        name: "attendance",
        component: resolve(PATHS.attendance),
      },
      {
        path: PATHS.history,
        name: "history",
        component: resolve(PATHS.history),
      },
      {
        path: PATHS.reports,
        name: "reports",
        component: resolve(PATHS.reports),
      },
      {
        path: "/students/:id",
        name: "student-record",
        component: resolve("/students/:id"),
      },
      {
        path: "/:pathMatch(.*)*",
        name: "not-found",
        component: stub,
      },
    ],
  });
}
