<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { PATHS } from "../router/paths";
import ClassSelector from "../components/ClassSelector.vue";
import StatCard from "../components/StatCard.vue";
import { useAttendanceStore } from "../stores/attendance";
import { downloadReportsCsv } from "../api/attendance";

const { t } = useI18n();
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
    downloadError.value = t("reports.downloadFailed");
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
    <div class="controls">
      <div class="control-group">
        <label>{{ t("reports.classLabel") }}</label>
        <ClassSelector v-model="selectedClassId" />
      </div>
    </div>

    <p v-if="attendanceStore.error" class="error">
      {{ attendanceStore.error }}
    </p>
    <p v-else-if="attendanceStore.loading" class="muted">
      {{ t("reports.loading") }}
    </p>
    <p v-else-if="selectedClassId === null" class="muted">
      {{ t("reports.selectClass") }}
    </p>

    <template v-else-if="attendanceStore.reports">
      <div class="report-toolbar">
        <div class="stat-cards">
          <StatCard
            :label="t('reports.totalSessions')"
            :value="attendanceStore.reports.totalSessions"
          />
          <StatCard
            :label="t('reports.classPresentRate')"
            :value="presentRate"
          />
        </div>
        <div class="download-group">
          <button :disabled="downloading" @click="handleDownload">
            {{
              downloading ? t("reports.downloading") : t("reports.downloadCsv")
            }}
          </button>
          <p v-if="downloadError" class="error download-error">
            {{ downloadError }}
          </p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>{{ t("reports.colStudent") }}</th>
            <th>{{ t("reports.colTotal") }}</th>
            <th>{{ t("reports.colPresent") }}</th>
            <th>{{ t("reports.colAbsent") }}</th>
            <th>{{ t("reports.colLate") }}</th>
            <th>{{ t("reports.colExcused") }}</th>
            <th>{{ t("reports.colPresentPct") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="student in attendanceStore.reports.students"
            :key="student.studentId"
          >
            <td>
              <RouterLink
                :to="PATHS.studentRecord(student.studentId)"
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
