import { defineStore } from "pinia";
import { ref } from "vue";
import * as classesApi from "../api/classes";
import type {
  Class,
  ClassCreate,
  ClassDetail,
  ClassUpdate,
} from "../types/class";

export const useClassesStore = defineStore("classes", () => {
  const classes = ref<Class[]>([]);
  const currentClass = ref<ClassDetail | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchClasses(): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      classes.value = await classesApi.listClasses();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load classes";
    } finally {
      loading.value = false;
    }
  }

  async function fetchClass(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      currentClass.value = await classesApi.getClass(id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to load class";
    } finally {
      loading.value = false;
    }
  }

  async function createClass(data: ClassCreate): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const created = await classesApi.createClass(data);
      classes.value.push(created);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to create class";
    } finally {
      loading.value = false;
    }
  }

  async function updateClass(id: number, data: ClassUpdate): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const updated = await classesApi.updateClass(id, data);
      const idx = classes.value.findIndex((c) => c.id === id);
      if (idx !== -1) classes.value[idx] = updated;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to update class";
    } finally {
      loading.value = false;
    }
  }

  async function deleteClass(id: number): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await classesApi.deleteClass(id);
      classes.value = classes.value.filter((c) => c.id !== id);
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to delete class";
    } finally {
      loading.value = false;
    }
  }

  async function addStudent(classId: number, name: string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const student = await classesApi.addStudent(classId, name);
      if (currentClass.value?.id === classId) {
        currentClass.value.students.push(student);
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to add student";
    } finally {
      loading.value = false;
    }
  }

  async function updateStudent(
    classId: number,
    studentId: number,
    name: string,
  ): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const updated = await classesApi.updateStudent(classId, studentId, name);
      if (currentClass.value?.id === classId) {
        const idx = currentClass.value.students.findIndex(
          (s) => s.id === studentId,
        );
        if (idx !== -1) currentClass.value.students[idx] = updated;
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to update student";
    } finally {
      loading.value = false;
    }
  }

  async function removeStudent(
    classId: number,
    studentId: number,
  ): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      await classesApi.removeStudent(classId, studentId);
      if (currentClass.value?.id === classId) {
        currentClass.value.students = currentClass.value.students.filter(
          (s) => s.id !== studentId,
        );
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to remove student";
    } finally {
      loading.value = false;
    }
  }

  return {
    classes,
    currentClass,
    loading,
    error,
    fetchClasses,
    fetchClass,
    createClass,
    updateClass,
    deleteClass,
    addStudent,
    updateStudent,
    removeStudent,
  };
});
