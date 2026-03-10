<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import ClassSelector from "../components/ClassSelector.vue";
import DateRangePicker from "../components/DateRangePicker.vue";
import AttendanceStatusBadge from "../components/AttendanceStatusBadge.vue";
import { useAttendanceStore } from "../stores/attendance";
import { useClassesStore } from "../stores/classes";

const attendanceStore = useAttendanceStore();
const classesStore = useClassesStore();

const selectedClassId = ref<number | null>(null);
const dateRange = ref({ from: "", to: "" });
const selectedSessionId = ref<number | null>(null);

const classNameById = computed(() => {
  const map: Record<number, string> = {};
  for (const c of classesStore.classes) {
    map[c.id] = `${c.name} (${c.period})`;
  }
  return map;
});

const filteredSessions = computed(() => {
  return attendanceStore.sessions.filter((s) => {
    if (dateRange.value.from && s.date < dateRange.value.from) return false;
    if (dateRange.value.to && s.date > dateRange.value.to) return false;
    return true;
  });
});

async function loadSessions() {
  selectedSessionId.value = null;
  await attendanceStore.fetchSessions(
    selectedClassId.value !== null
      ? { classId: selectedClassId.value }
      : undefined,
  );
}

async function selectSession(id: number) {
  if (selectedSessionId.value === id) {
    selectedSessionId.value = null;
    return;
  }
  selectedSessionId.value = id;
  await attendanceStore.fetchSession(id);
}

onMounted(loadSessions);
watch(selectedClassId, loadSessions);
</script>

<template>
  <div class="page">
    <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
    <div class="header">
      <h1>Attendance History</h1>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Class</label>
        <ClassSelector v-model="selectedClassId" />
      </div>
      <div class="control-group">
        <label>Date range</label>
        <DateRangePicker v-model="dateRange" />
      </div>
    </div>

    <p v-if="attendanceStore.error" class="error">
      {{ attendanceStore.error }}
    </p>
    <p v-else-if="attendanceStore.loading" class="muted">Loading…</p>
    <p v-else-if="filteredSessions.length === 0" class="muted">
      No sessions found.
    </p>

    <template v-else>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Class</th>
            <th>Period</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="session in filteredSessions"
            :key="session.id"
            class="session-row"
            :class="{ selected: session.id === selectedSessionId }"
            @click="selectSession(session.id)"
          >
            <td>{{ session.date }}</td>
            <td>
              {{ classNameById[session.classId] ?? `Class ${session.classId}` }}
            </td>
            <td>{{ session.period }}</td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="selectedSessionId !== null && attendanceStore.currentSession"
        class="detail-panel"
      >
        <h2>
          Session detail —
          {{ attendanceStore.currentSession.date }}
        </h2>
        <p v-if="attendanceStore.loading" class="muted">Loading records…</p>
        <table v-else>
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in attendanceStore.currentSession.records"
              :key="record.id"
            >
              <td>{{ record.studentId }}</td>
              <td>
                <AttendanceStatusBadge :status="record.status" :active="true" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

.back-link {
  display: inline-block;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  color: #94a3b8;
  text-decoration: none;
}

.back-link:hover {
  color: #646cff;
}

.header {
  display: flex;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 600;
}

h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
}

.controls {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: flex-end;
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

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  border-bottom: 2px solid #334155;
  color: #94a3b8;
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
}

td {
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #1e293b;
}

.session-row {
  cursor: pointer;
}

.session-row:hover td {
  background: #1e293b;
}

.session-row.selected td {
  background: #1e293b;
  border-bottom-color: #334155;
}

.detail-panel {
  margin-top: 2rem;
  padding: 1.25rem;
  border: 1px solid #334155;
  border-radius: 8px;
}

.error {
  color: #f87171;
}

.muted {
  color: #94a3b8;
}

@media (prefers-color-scheme: light) {
  .back-link {
    color: #64748b;
  }

  .header {
    border-color: #e2e8f0;
  }

  label {
    color: #64748b;
  }

  th {
    border-color: #e2e8f0;
    color: #64748b;
  }

  td {
    border-color: #f1f5f9;
  }

  .session-row:hover td,
  .session-row.selected td {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .detail-panel {
    border-color: #e2e8f0;
  }

  .error {
    color: #dc2626;
  }

  .muted {
    color: #64748b;
  }
}
</style>
