<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AttendanceRoster from "../components/AttendanceRoster.vue";
import ClassSelector from "../components/ClassSelector.vue";
import { useAttendanceStore } from "../stores/attendance";
import { useClassesStore } from "../stores/classes";
import type { AttendanceRecordDraft } from "../types/attendance";

const classesStore = useClassesStore();
const attendanceStore = useAttendanceStore();

const today = new Date().toISOString().split("T")[0];
const selectedClassId = ref<number | null>(null);
const selectedDate = ref<string>(today);
const drafts = ref<AttendanceRecordDraft[]>([]);
const submitted = ref(false);
const submittedClassName = ref("");
const submittedDate = ref("");

watch(selectedClassId, async (id) => {
  drafts.value = [];
  attendanceStore.error = null;
  if (id === null) return;
  await classesStore.fetchClass(id);
  if (classesStore.currentClass) {
    drafts.value = classesStore.currentClass.students.map((s) => ({
      studentId: s.id,
      status: "absent" as const,
    }));
  }
});

const canSubmit = computed(
  () =>
    selectedClassId.value !== null &&
    drafts.value.length > 0 &&
    !attendanceStore.submitting,
);

async function submit() {
  if (!canSubmit.value || selectedClassId.value === null) return;
  submittedClassName.value = classesStore.currentClass?.name ?? "";
  submittedDate.value = selectedDate.value;
  const result = await attendanceStore.submitAttendance({
    classId: selectedClassId.value,
    date: selectedDate.value,
    records: drafts.value,
  });
  if (result) {
    submitted.value = true;
  }
}

function takeAnother() {
  submitted.value = false;
  selectedClassId.value = null;
  selectedDate.value = new Date().toISOString().split("T")[0];
  drafts.value = [];
}
</script>

<template>
  <div class="page">
    <div class="header">
      <h1>Take Attendance</h1>
    </div>

    <!-- Success state -->
    <div v-if="submitted" class="success-card">
      <div class="checkmark">
        <svg viewBox="0 0 52 52" class="checkmark-svg">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
          <path class="checkmark-check" fill="none" d="M14 27l8 8 16-16" />
        </svg>
      </div>
      <h2>Attendance submitted!</h2>
      <p class="success-detail">
        {{ submittedClassName }} &mdash; {{ submittedDate }}
      </p>
      <div class="success-actions">
        <button class="btn-primary" @click="takeAnother">Take another</button>
      </div>
    </div>

    <template v-else>
      <div class="controls">
        <div class="control-group">
          <label for="class-select">Class</label>
          <ClassSelector id="class-select" v-model="selectedClassId" />
        </div>
        <div class="control-group">
          <label for="date-input">Date</label>
          <input id="date-input" v-model="selectedDate" type="date" />
        </div>
      </div>

      <p v-if="attendanceStore.error" class="error">
        {{ attendanceStore.error }}
      </p>

      <p v-if="classesStore.loading" class="muted">Loading roster…</p>

      <template v-else-if="selectedClassId !== null">
        <p v-if="drafts.length === 0" class="muted">
          This class has no students yet.
        </p>
        <AttendanceRoster
          v-else
          v-model="drafts"
          :students="classesStore.currentClass?.students ?? []"
        />

        <div class="submit-row">
          <button class="btn-primary" :disabled="!canSubmit" @click="submit">
            {{
              attendanceStore.submitting ? "Submitting…" : "Submit Attendance"
            }}
          </button>
        </div>
      </template>

      <p v-else class="muted">Select a class to begin.</p>
    </template>
  </div>
</template>

<style scoped>
.page {
  max-width: 960px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 2rem;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #334155;
}

.success-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
}

.success-card h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.success-detail {
  color: #94a3b8;
  margin: 0;
}

.success-actions {
  margin-top: 1rem;
}

.checkmark {
  width: 72px;
  height: 72px;
}

.checkmark-svg {
  width: 100%;
  height: 100%;
}

.checkmark-circle {
  stroke: #22c55e;
  stroke-width: 2;
  stroke-dasharray: 157;
  stroke-dashoffset: 157;
  animation: draw-circle 0.4s ease forwards;
}

.checkmark-check {
  stroke: #22c55e;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: draw-check 0.3s ease 0.35s forwards;
}

@keyframes draw-circle {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes draw-check {
  to {
    stroke-dashoffset: 0;
  }
}

h1 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 600;
}

.controls {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

select,
input[type="date"] {
  padding: 0.375rem 0.625rem;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #1e293b;
  color: inherit;
}

.error {
  color: #f87171;
  margin-bottom: 1rem;
}

.muted {
  color: #94a3b8;
}

.submit-row {
  margin-top: 1.5rem;
}

.btn-primary {
  background-color: #646cff;
  color: #fff;
  border-color: transparent;
  font-weight: 500;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

.btn-primary:hover:not(:disabled) {
  background-color: #535bf2;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: light) {
  .header {
    border-color: #e2e8f0;
  }

  label {
    color: #64748b;
  }

  select,
  input[type="date"] {
    border-color: #cbd5e1;
    background: #fff;
  }

  .error {
    color: #dc2626;
  }

  .muted {
    color: #64748b;
  }
}
</style>
