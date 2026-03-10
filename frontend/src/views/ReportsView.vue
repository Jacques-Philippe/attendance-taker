<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import ClassSelector from "../components/ClassSelector.vue";
import StatCard from "../components/StatCard.vue";
import { useAttendanceStore } from "../stores/attendance";
import { downloadReportsCsv } from "../api/attendance";

const attendanceStore = useAttendanceStore();

const selectedClassId = ref<number | null>(null);

const downloading = ref(false);
const downloadError = ref<string | null>(null);

async function handleDownload() {
  downloading.value = true;
  downloadError.value = null;
  try {
    await downloadReportsCsv(selectedClassId!.value!);
  } catch {
    downloadError.value = "Download failed. Please try again.";
  } finally {
    downloading.value = false;
  }
}

const presentRate = computed(() => {
  const r = attendanceStore.reports;
  if (!r || r.students.length === 0) return "—";
  const totalPresent = r.students.reduce((sum, s) => sum + s.present, 0);
  const totalRecords = r.students.reduce((sum, s) => sum + s.total, 0);
  if (totalRecords === 0) return "—";
  return `${Math.round((totalPresent / totalRecords) * 100)}%`;
});

watch(selectedClassId, (id) => {
  if (id !== null) attendanceStore.fetchReports(id);
});
</script>

<template>
  <div class="page">
    <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
    <div class="header">
      <h1>Reports</h1>
    </div>

    <div class="controls">
      <div class="control-group">
        <label>Class</label>
        <ClassSelector v-model="selectedClassId" />
      </div>
    </div>

    <p v-if="attendanceStore.error" class="error">
      {{ attendanceStore.error }}
    </p>
    <p v-else-if="attendanceStore.loading" class="muted">Loading…</p>
    <p v-else-if="selectedClassId === null" class="muted">
      Select a class to view its report.
    </p>

    <template v-else-if="attendanceStore.reports">
      <div class="report-toolbar">
        <div class="stat-cards">
          <StatCard
            label="Total Sessions"
            :value="attendanceStore.reports.totalSessions"
          />
          <StatCard label="Class Present Rate" :value="presentRate" />
        </div>
        <div class="download-group">
          <button @click="handleDownload" :disabled="downloading">
            {{ downloading ? "Downloading…" : "Download CSV" }}
          </button>
          <p v-if="downloadError" class="error download-error">
            {{ downloadError }}
          </p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Total</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
            <th>Excused</th>
            <th>Present %</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in attendanceStore.reports.students"
            :key="student.studentId"
          >
            <td>
              <RouterLink
                :to="`/students/${student.studentId}`"
                class="student-link"
              >
                {{ student.studentName }}
              </RouterLink>
            </td>
            <td>{{ student.total }}</td>
            <td>{{ student.present }}</td>
            <td>{{ student.absent }}</td>
            <td>{{ student.late }}</td>
            <td>{{ student.excused }}</td>
            <td>
              {{
                student.total > 0
                  ? `${Math.round((student.present / student.total) * 100)}%`
                  : "—"
              }}
            </td>
          </tr>
        </tbody>
      </table>
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

.controls {
  display: flex;
  gap: 1.5rem;
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

.report-toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-cards {
  display: flex;
  gap: 1rem;
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

.student-link {
  color: #818cf8;
  text-decoration: none;
}

.student-link:hover {
  text-decoration: underline;
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

  .student-link {
    color: #4f46e5;
  }

  .error {
    color: #dc2626;
  }

  .muted {
    color: #64748b;
  }
}
</style>
