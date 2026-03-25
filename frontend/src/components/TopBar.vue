<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const route = useRoute();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const avatarRef = ref<HTMLButtonElement | null>(null);

const avatarLetter = computed(() => {
  return authStore.user?.username?.[0]?.toUpperCase() || "?";
});

// Generate breadcrumbs based on current route
const breadcrumbs = computed(() => {
  const crumbs: Array<{ name: string; path: string; isCurrent: boolean }> = [];

  // Map route names to breadcrumb labels
  const routeLabels: Record<string, string> = {
    dashboard: "Dashboard",
    classes: "Classes",
    attendance: "Take Attendance",
    history: "History",
    reports: "Reports",
    "student-record": "Student Record",
  };

  const routeName = route.name as string;
  const currentLabel = routeLabels[routeName] || routeName || "Home";

  // Add Home link first (except for dashboard)
  if (routeName !== "dashboard") {
    crumbs.push({
      name: "Home",
      path: "/dashboard",
      isCurrent: false,
    });
  }

  // Add current page (non-clickable if it's dashboard)
  crumbs.push({
    name: currentLabel,
    path: route.path,
    isCurrent: true,
  });

  return crumbs;
});

// Show breadcrumbs except on dashboard
const showBreadcrumbs = computed(() => {
  return route.name !== "dashboard";
});

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const handleLogout = async () => {
  closeDropdown();
  await authStore.logout();
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (
    dropdownRef.value &&
    avatarRef.value &&
    !dropdownRef.value.contains(target) &&
    !avatarRef.value.contains(target)
  ) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <header class="top-bar">
    <div class="top-bar-content">
      <!-- Breadcrumbs (left) -->
      <div v-if="showBreadcrumbs" class="breadcrumbs">
        <nav class="breadcrumb-nav" aria-label="Breadcrumb">
          <ul class="breadcrumb-list">
            <li
              v-for="(crumb, idx) in breadcrumbs"
              :key="idx"
              class="breadcrumb-item"
            >
              <RouterLink
                v-if="!crumb.isCurrent"
                :to="crumb.path"
                class="breadcrumb-link"
              >
                {{ crumb.name }}
              </RouterLink>
              <span v-else class="breadcrumb-current">{{ crumb.name }}</span>
              <span
                v-if="idx < breadcrumbs.length - 1"
                class="breadcrumb-separator"
                >/</span
              >
            </li>
          </ul>
        </nav>
      </div>

      <div class="top-bar-spacer"></div>

      <!-- Avatar + Dropdown (right) -->
      <div class="avatar-container">
        <button
          ref="avatarRef"
          class="avatar-button"
          :aria-label="`User menu for ${authStore.user?.username}`"
          @click="toggleDropdown"
        >
          {{ avatarLetter }}
        </button>

        <div v-if="isDropdownOpen" ref="dropdownRef" class="dropdown-menu">
          <div class="dropdown-header">
            <span class="username">{{ authStore.user?.username }}</span>
          </div>
          <button class="dropdown-button logout-button" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #242424;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 100;
  display: flex;
  align-items: center;
}

.top-bar-content {
  width: 100%;
  height: 100%;
  padding: 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-bar-spacer {
  flex: 1;
}

.avatar-container {
  position: relative;
  display: flex;
  align-items: center;
}

.avatar-button {
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background-color: #646cff;
  color: rgba(255, 255, 255, 0.87);
  border: none;
  font-size: 1.2em;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 250ms ease-in-out,
    box-shadow 250ms ease-in-out;
}

.avatar-button:hover {
  background-color: #535bf2;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
}

.avatar-button:focus {
  outline: 2px solid #646cff;
  outline-offset: 2px;
}

.avatar-button:active {
  background-color: #4a5dd4;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #242424;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 0;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
  animation: slideDown 250ms ease-in-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.username {
  display: block;
  font-size: 0.875em;
  color: rgba(255, 255, 255, 0.87);
  font-weight: 500;
  word-break: break-word;
}

.dropdown-button {
  width: 100%;
  padding: 12px 16px;
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.87);
  font-size: 0.875em;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 250ms ease-in-out,
    color 250ms ease-in-out;
}

.dropdown-button:hover {
  background-color: #1a1a1a;
  color: #646cff;
}

.dropdown-button:focus {
  outline: 2px solid #646cff;
  outline-offset: -2px;
}

.logout-button {
  color: #ef4444;
}

.logout-button:hover {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ff6b6b;
}

/* Breadcrumbs */
.breadcrumbs {
  flex: 1;
  padding: 0 16px;
  min-width: 0;
}

.breadcrumb-nav {
  max-width: 100%;
}

.breadcrumb-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875em;
  overflow: hidden;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.breadcrumb-link {
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 250ms ease-in-out;
}

.breadcrumb-link:hover {
  color: rgba(255, 255, 255, 0.87);
}

.breadcrumb-link:focus {
  outline: 2px solid #646cff;
  outline-offset: 2px;
}

.breadcrumb-current {
  color: rgba(255, 255, 255, 0.87);
  font-weight: 500;
}

.breadcrumb-separator {
  color: rgba(255, 255, 255, 0.4);
  flex-shrink: 0;
}

/* Mobile adjustments */
@media (max-width: 767px) {
  .top-bar {
    height: 56px;
  }

  .avatar-button {
    width: 40px;
    height: 40px;
    font-size: 1em;
  }

  .dropdown-menu {
    min-width: 180px;
  }

  .breadcrumbs {
    padding: 0 12px;
  }

  .breadcrumb-list {
    font-size: 0.75em;
    gap: 2px;
  }

  .breadcrumb-item:nth-child(n + 2):not(:last-child) {
    display: none;
  }

  .breadcrumb-separator {
    margin: 0 1px;
  }
}
</style>
