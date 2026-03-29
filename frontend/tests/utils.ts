import { createRouter, createMemoryHistory } from "vue-router";
import { createI18n } from "vue-i18n";
import type { Component } from "vue";
import en from "@/i18n/locales/en.json";

const stub = { template: "<div />" };

/**
 * Creates a fresh vue-i18n instance for use in unit tests (English locale).
 */
export function makeI18n() {
  return createI18n({ legacy: false, locale: "en", messages: { en } });
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
      { path: "/login", component: resolve("/login") },
      { path: "/register", component: resolve("/register") },
      { path: "/dashboard", component: resolve("/dashboard") },
      { path: "/classes", component: resolve("/classes") },
      { path: "/attendance", component: resolve("/attendance") },
      { path: "/history", component: resolve("/history") },
      { path: "/reports", component: resolve("/reports") },
      { path: "/students/:id", component: resolve("/students/:id") },
    ],
  });
}
