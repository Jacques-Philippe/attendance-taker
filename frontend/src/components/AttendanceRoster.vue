<script setup lang="ts">
import type { Student } from "../types/class";
import type {
  AttendanceRecordDraft,
  AttendanceStatus,
} from "../types/attendance";
import AttendanceStatusBadge from "./AttendanceStatusBadge.vue";

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

const props = defineProps<{
  students: Student[];
  modelValue: AttendanceRecordDraft[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: AttendanceRecordDraft[]];
}>();

function setStatus(studentId: number, status: AttendanceStatus) {
  const updated = props.modelValue.map((d) =>
    d.studentId === studentId ? { ...d, status } : d,
  );
  emit("update:modelValue", updated);
}

function currentStatus(studentId: number): AttendanceStatus | undefined {
  return props.modelValue.find((d) => d.studentId === studentId)?.status;
}
</script>

<template>
  <table class="roster">
    <thead>
      <tr>
        <th class="col-name">Student</th>
        <th class="col-status">Status</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="student in students" :key="student.id">
        <td class="col-name">{{ student.name }}</td>
        <td class="col-status">
          <div class="badge-group">
            <AttendanceStatusBadge
              v-for="s in STATUSES"
              :key="s"
              :status="s"
              :active="currentStatus(student.id) === s"
              @click="setStatus(student.id, s)"
            />
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.roster {
  width: 100%;
  border-collapse: collapse;
}

.roster th,
.roster td {
  padding: 0.625rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #334155;
}

.roster thead th {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.col-name {
  width: 40%;
}

.badge-group {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

@media (prefers-color-scheme: light) {
  .roster th,
  .roster td {
    border-color: #e2e8f0;
  }

  .roster thead th {
    color: #64748b;
  }
}
</style>
