<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useLocaleStore, SUPPORTED_LOCALES } from "../stores/locale";

const { t } = useI18n();
const localeStore = useLocaleStore();
const emit = defineEmits<{ close: [] }>();

const modalRef = ref<HTMLElement | null>(null);

function selectLocale(code: (typeof SUPPORTED_LOCALES)[number]["code"]) {
  localeStore.setLocale(code);
  emit("close");
}

function onBackdropClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit("close");
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    emit("close");
  }
  if (event.key === "Tab" && modalRef.value) {
    const focusable = modalRef.value.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey) {
      if (document.activeElement === first) {
        event.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  modalRef.value?.querySelector<HTMLElement>("button")?.focus();
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div
    class="backdrop"
    role="dialog"
    aria-modal="true"
    :aria-label="t('topbar.language')"
    @click="onBackdropClick"
  >
    <div ref="modalRef" class="modal">
      <p class="modal-title">{{ t("topbar.language") }}</p>
      <div class="locale-list">
        <button
          v-for="loc in SUPPORTED_LOCALES"
          :key="loc.code"
          class="locale-button"
          :class="{ active: localeStore.current === loc.code }"
          @click="selectLocale(loc.code)"
        >
          {{ loc.label }}
        </button>
      </div>
      <button
        class="close-button"
        :aria-label="t('common.close')"
        @click="emit('close')"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fade-in 150ms ease-in-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  position: relative;
  background-color: #242424;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  min-width: 220px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.8);
  animation: slide-up 150ms ease-in-out;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-title {
  margin: 0 0 1rem;
  font-size: 0.75em;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.4);
}

.locale-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.locale-button {
  width: 100%;
  padding: 0.6rem 0.75rem;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.87);
  font-size: 0.875em;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 250ms ease-in-out,
    color 250ms ease-in-out;
}

.locale-button:hover {
  background-color: #1a1a1a;
  color: #646cff;
}

.locale-button:focus {
  outline: 2px solid #646cff;
  outline-offset: -2px;
}

.locale-button.active {
  color: #646cff;
  border-color: rgba(100, 108, 255, 0.3);
}

.close-button {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.875em;
  cursor: pointer;
  padding: 0.25rem;
  line-height: 1;
  transition: color 250ms ease-in-out;
}

.close-button:hover {
  color: rgba(255, 255, 255, 0.87);
}

.close-button:focus {
  outline: 2px solid #646cff;
  outline-offset: 2px;
}
</style>
