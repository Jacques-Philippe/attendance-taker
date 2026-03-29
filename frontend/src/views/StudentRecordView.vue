<script setup lang="ts">
import { onMounted } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import AttendanceStatusBadge from "../components/AttendanceStatusBadge.vue";
import { useAttendanceStore } from "../stores/attendance";
import { PATHS } from "../router/paths";

const { t } = useI18n();
const route = useRoute();
const attendanceStore = useAttendanceStore();

onMounted(() => {
  attendanceStore.fetchStudentHistory(Number(route.params.id));
});
</script>

<template>
  <div class="page">
    <RouterLink :to="PATHS.reports" class="back-link">{{
      t("studentRecord.backToReports")
    }}</RouterLink>

    <p v-if="attendanceStore.error" class="error">
      {{ attendanceStore.error }}
    </p>
    <p v-else-if="attendanceStore.loading" class="muted">
      {{ t("studentRecord.loading") }}
    </p>

    <template v-else-if="attendanceStore.studentHistory">
      <div class="header">
        <h1>{{ attendanceStore.studentHistory.studentName }}</h1>
        <span class="class-label">
          {{ attendanceStore.studentHistory.className }}
        </span>
      </div>

      <p
        v-if="attendanceStore.studentHistory.records.length === 0"
        class="muted"
      >
        {{ t("studentRecord.noRecords") }}
      </p>
      <table v-else>
        <thead>
          <tr>
            <th>{{ t("studentRecord.colDate") }}</th>
            <th>{{ t("studentRecord.colPeriod") }}</th>
            <th>{{ t("studentRecord.colStatus") }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="record in attendanceStore.studentHistory.records"
            :key="record.sessionId"
          >
            <td>{{ record.date }}</td>
            <td>{{ record.period }}</td>
            <td>
              <AttendanceStatusBadge :status="record.status" :active="true" />
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
  align-items: baseline;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 600;
}

.class-label {
  color: #94a3b8;
  font-size: 0.95rem;
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

  .class-label {
    color: #64748b;
  }

  th {
    border-color: #e2e8f0;
    color: #64748b;
  }

  td {
    border-color: #f1f5f9;
  }

  .error {
    color: #dc2626;
  }

  .muted {
    color: #64748b;
  }
}
</style>
