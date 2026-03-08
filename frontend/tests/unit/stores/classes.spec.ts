import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useClassesStore } from "@/stores/classes";

const {
  mockListClasses,
  mockGetClass,
  mockCreateClass,
  mockDeleteClass,
  mockAddStudent,
  mockRemoveStudent,
} = vi.hoisted(() => ({
  mockListClasses: vi.fn(),
  mockGetClass: vi.fn(),
  mockCreateClass: vi.fn(),
  mockDeleteClass: vi.fn(),
  mockAddStudent: vi.fn(),
  mockRemoveStudent: vi.fn(),
}));

vi.mock("@/api/classes", () => ({
  listClasses: mockListClasses,
  getClass: mockGetClass,
  createClass: mockCreateClass,
  updateClass: vi.fn(),
  deleteClass: mockDeleteClass,
  addStudent: mockAddStudent,
  updateStudent: vi.fn(),
  removeStudent: mockRemoveStudent,
}));

const cls1 = { id: 1, name: "Math", period: "1st", teacherId: 10 };
const cls2 = { id: 2, name: "English", period: "2nd", teacherId: 10 };
const student1 = { id: 100, name: "Alice", classId: 1 };
const student2 = { id: 101, name: "Bob", classId: 1 };
const classDetail = { ...cls1, students: [student1, student2] };

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
});

// ─── fetchClasses ────────────────────────────────────────────────────────────

describe("useClassesStore — fetchClasses()", () => {
  it("populates classes and clears loading", async () => {
    mockListClasses.mockResolvedValueOnce([cls1, cls2]);
    const store = useClassesStore();
    await store.fetchClasses();
    expect(store.classes).toEqual([cls1, cls2]);
    expect(store.loading).toBe(false);
  });

  it("sets error and clears loading on API failure", async () => {
    mockListClasses.mockRejectedValueOnce(new Error("Network error"));
    const store = useClassesStore();
    await store.fetchClasses();
    expect(store.error).toBe("Network error");
    expect(store.loading).toBe(false);
    expect(store.classes).toEqual([]);
  });
});

// ─── createClass ─────────────────────────────────────────────────────────────

describe("useClassesStore — createClass()", () => {
  it("calls api and appends to classes", async () => {
    mockListClasses.mockResolvedValueOnce([cls1]);
    mockCreateClass.mockResolvedValueOnce(cls2);
    const store = useClassesStore();
    await store.fetchClasses();
    await store.createClass({ name: "English", period: "2nd" });
    expect(mockCreateClass).toHaveBeenCalledWith({
      name: "English",
      period: "2nd",
    });
    expect(store.classes).toEqual([cls1, cls2]);
    expect(store.loading).toBe(false);
  });

  it("sets error and clears loading on API failure", async () => {
    mockCreateClass.mockRejectedValueOnce(new Error("Server error"));
    const store = useClassesStore();
    await store.createClass({ name: "X", period: "Y" });
    expect(store.error).toBe("Server error");
    expect(store.loading).toBe(false);
  });
});

// ─── deleteClass ─────────────────────────────────────────────────────────────

describe("useClassesStore — deleteClass()", () => {
  it("calls api and removes from classes", async () => {
    mockListClasses.mockResolvedValueOnce([cls1, cls2]);
    mockDeleteClass.mockResolvedValueOnce(undefined);
    const store = useClassesStore();
    await store.fetchClasses();
    await store.deleteClass(cls1.id);
    expect(mockDeleteClass).toHaveBeenCalledWith(cls1.id);
    expect(store.classes).toEqual([cls2]);
    expect(store.loading).toBe(false);
  });

  it("sets error and clears loading on API failure", async () => {
    mockListClasses.mockResolvedValueOnce([cls1]);
    mockDeleteClass.mockRejectedValueOnce(new Error("Delete failed"));
    const store = useClassesStore();
    await store.fetchClasses();
    await store.deleteClass(cls1.id);
    expect(store.error).toBe("Delete failed");
    expect(store.loading).toBe(false);
    expect(store.classes).toEqual([cls1]);
  });
});

// ─── addStudent ──────────────────────────────────────────────────────────────

describe("useClassesStore — addStudent()", () => {
  it("calls api and appends to currentClass.students", async () => {
    const newStudent = { id: 102, name: "Charlie", classId: 1 };
    mockGetClass.mockResolvedValueOnce({
      ...classDetail,
      students: [...classDetail.students],
    });
    mockAddStudent.mockResolvedValueOnce(newStudent);
    const store = useClassesStore();
    await store.fetchClass(cls1.id);
    await store.addStudent(cls1.id, "Charlie");
    expect(mockAddStudent).toHaveBeenCalledWith(cls1.id, "Charlie");
    expect(store.currentClass?.students).toEqual([
      student1,
      student2,
      newStudent,
    ]);
    expect(store.loading).toBe(false);
  });

  it("sets error and clears loading on API failure", async () => {
    mockGetClass.mockResolvedValueOnce({
      ...classDetail,
      students: [...classDetail.students],
    });
    mockAddStudent.mockRejectedValueOnce(new Error("Add failed"));
    const store = useClassesStore();
    await store.fetchClass(cls1.id);
    await store.addStudent(cls1.id, "Charlie");
    expect(store.error).toBe("Add failed");
    expect(store.loading).toBe(false);
    expect(store.currentClass?.students).toEqual([student1, student2]);
  });
});

// ─── removeStudent ───────────────────────────────────────────────────────────

describe("useClassesStore — removeStudent()", () => {
  it("calls api and removes from currentClass.students", async () => {
    mockGetClass.mockResolvedValueOnce({
      ...classDetail,
      students: [...classDetail.students],
    });
    mockRemoveStudent.mockResolvedValueOnce(undefined);
    const store = useClassesStore();
    await store.fetchClass(cls1.id);
    await store.removeStudent(cls1.id, student1.id);
    expect(mockRemoveStudent).toHaveBeenCalledWith(cls1.id, student1.id);
    expect(store.currentClass?.students).toEqual([student2]);
    expect(store.loading).toBe(false);
  });

  it("sets error and clears loading on API failure", async () => {
    mockGetClass.mockResolvedValueOnce({
      ...classDetail,
      students: [...classDetail.students],
    });
    mockRemoveStudent.mockRejectedValueOnce(new Error("Remove failed"));
    const store = useClassesStore();
    await store.fetchClass(cls1.id);
    await store.removeStudent(cls1.id, student1.id);
    expect(store.error).toBe("Remove failed");
    expect(store.loading).toBe(false);
    expect(store.currentClass?.students).toEqual([student1, student2]);
  });
});
