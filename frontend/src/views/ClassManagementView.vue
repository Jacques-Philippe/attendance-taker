<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useClassesStore } from "../stores/classes";

const store = useClassesStore();

// New class form
const showNewClassForm = ref(false);
const newClassName = ref("");
const newClassPeriod = ref("");

// Edit class state: classId → { name, period }
const editingClass = ref<Record<number, { name: string; period: string }>>({});

// Expanded student panels
const expandedClass = ref<number | null>(null);

// Add student input per class
const newStudentName = ref<Record<number, string>>({});

// Edit student state: studentId → name
const editingStudent = ref<Record<number, string>>({});

onMounted(() => store.fetchClasses());

async function submitNewClass() {
  if (!newClassName.value.trim() || !newClassPeriod.value.trim()) return;
  await store.createClass({
    name: newClassName.value.trim(),
    period: newClassPeriod.value.trim(),
  });
  newClassName.value = "";
  newClassPeriod.value = "";
  showNewClassForm.value = false;
}

function startEditClass(id: number, name: string, period: string) {
  editingClass.value[id] = { name, period };
}

async function submitEditClass(id: number) {
  const data = editingClass.value[id];
  if (!data) return;
  await store.updateClass(id, { name: data.name, period: data.period });
  delete editingClass.value[id];
}

function cancelEditClass(id: number) {
  delete editingClass.value[id];
}

async function confirmDeleteClass(id: number, name: string) {
  if (!window.confirm(`Delete class "${name}" and all its students?`)) return;
  await store.deleteClass(id);
  if (expandedClass.value === id) expandedClass.value = null;
}

async function toggleStudents(id: number) {
  if (expandedClass.value === id) {
    expandedClass.value = null;
    return;
  }
  await store.fetchClass(id);
  expandedClass.value = id;
}

async function submitAddStudent(classId: number) {
  const name = (newStudentName.value[classId] ?? "").trim();
  if (!name) return;
  await store.addStudent(classId, name);
  newStudentName.value[classId] = "";
}

function startEditStudent(studentId: number, name: string) {
  editingStudent.value[studentId] = name;
}

async function submitEditStudent(classId: number, studentId: number) {
  const name = (editingStudent.value[studentId] ?? "").trim();
  if (!name) return;
  await store.updateStudent(classId, studentId, name);
  delete editingStudent.value[studentId];
}

function cancelEditStudent(studentId: number) {
  delete editingStudent.value[studentId];
}

async function removeStudent(classId: number, studentId: number, name: string) {
  if (!window.confirm(`Remove student "${name}"?`)) return;
  await store.removeStudent(classId, studentId);
}
</script>

<template>
  <div class="page">
    <RouterLink to="/dashboard" class="back-link">← Dashboard</RouterLink>
    <div class="header">
      <h1>Classes</h1>
      <button class="btn-primary" @click="showNewClassForm = !showNewClassForm">
        + New class
      </button>
    </div>

    <form
      v-if="showNewClassForm"
      class="inline-form"
      @submit.prevent="submitNewClass"
    >
      <input v-model="newClassName" placeholder="Class name" required />
      <input v-model="newClassPeriod" placeholder="Period" required />
      <button type="submit">Create</button>
      <button type="button" @click="showNewClassForm = false">Cancel</button>
    </form>

    <p v-if="store.error" class="error">{{ store.error }}</p>

    <ul class="class-list">
      <li v-for="cls in store.classes" :key="cls.id" class="class-row">
        <!-- View or edit row -->
        <div class="class-info">
          <template v-if="editingClass[cls.id]">
            <input v-model="editingClass[cls.id].name" placeholder="Name" />
            <input v-model="editingClass[cls.id].period" placeholder="Period" />
            <button @click="submitEditClass(cls.id)">Save</button>
            <button @click="cancelEditClass(cls.id)">Cancel</button>
          </template>
          <template v-else>
            <span class="class-name">{{ cls.name }}</span>
            <span class="class-period">{{ cls.period }}</span>
            <button @click="startEditClass(cls.id, cls.name, cls.period)">
              Edit
            </button>
            <button
              class="danger"
              @click="confirmDeleteClass(cls.id, cls.name)"
            >
              Delete
            </button>
            <button @click="toggleStudents(cls.id)">
              {{
                expandedClass === cls.id ? "Hide students" : "Manage students"
              }}
            </button>
          </template>
        </div>

        <!-- Student panel -->
        <div
          v-if="expandedClass === cls.id && store.currentClass?.id === cls.id"
          class="student-panel"
        >
          <ul class="student-list">
            <li
              v-for="student in store.currentClass.students"
              :key="student.id"
              class="student-row"
            >
              <template v-if="editingStudent[student.id] !== undefined">
                <input v-model="editingStudent[student.id]" />
                <button @click="submitEditStudent(cls.id, student.id)">
                  Save
                </button>
                <button @click="cancelEditStudent(student.id)">Cancel</button>
              </template>
              <template v-else>
                <span>{{ student.name }}</span>
                <button @click="startEditStudent(student.id, student.name)">
                  Rename
                </button>
                <button
                  class="danger"
                  @click="removeStudent(cls.id, student.id, student.name)"
                >
                  Remove
                </button>
              </template>
            </li>
          </ul>
          <form class="inline-form" @submit.prevent="submitAddStudent(cls.id)">
            <input
              v-model="newStudentName[cls.id]"
              placeholder="Student name"
              required
            />
            <button type="submit">Add student</button>
          </form>
        </div>
      </li>
    </ul>
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
  justify-content: space-between;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #334155;
}

h1 {
  font-size: 1.75rem;
  margin: 0;
  font-weight: 600;
}

.btn-primary {
  background-color: #646cff;
  color: #fff;
  border-color: transparent;
  font-weight: 500;
}

.btn-primary:hover {
  background-color: #535bf2;
}

@media (prefers-color-scheme: light) {
  .back-link {
    color: #64748b;
  }

  .header {
    border-color: #e2e8f0;
  }
}

.inline-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.error {
  color: #f87171;
  margin-bottom: 1rem;
}

.class-list,
.student-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.class-row {
  border: 1px solid #334155;
  border-radius: 6px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.class-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  flex-wrap: wrap;
}

.class-name {
  font-weight: 600;
  flex: 1;
}

.class-period {
  color: #94a3b8;
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.student-panel {
  background: #1e293b;
  border-top: 1px solid #334155;
  padding: 0.75rem 1rem;
}

.student-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
}

.student-row span {
  flex: 1;
}

input {
  padding: 0.375rem 0.625rem;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.875rem;
  font-family: inherit;
  background: #1e293b;
  color: inherit;
}

button {
  padding: 0.375rem 0.75rem;
  border: 1px solid #475569;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
}

button.danger {
  color: #f87171;
  border-color: #7f1d1d;
}

button.danger:hover {
  background: #450a0a;
}

@media (prefers-color-scheme: light) {
  .error {
    color: #dc2626;
  }

  .class-row {
    border-color: #e2e8f0;
  }

  .class-period {
    color: #64748b;
  }

  .student-panel {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  input {
    border-color: #cbd5e1;
    background: #fff;
  }

  button {
    border-color: #cbd5e1;
  }

  button:hover {
    background: #f1f5f9;
  }

  button.danger {
    color: #dc2626;
    border-color: #fca5a5;
  }

  button.danger:hover {
    background: #fee2e2;
  }
}
</style>
