<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const avatarRef = ref<HTMLButtonElement | null>(null);

const avatarLetter = computed(() => {
  return authStore.user?.username?.[0]?.toUpperCase() || "?";
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
      <div class="top-bar-spacer"></div>

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
}
</style>
