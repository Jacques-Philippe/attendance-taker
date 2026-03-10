import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AttendanceRoster from "@/components/AttendanceRoster.vue";
import type { AttendanceRecordDraft } from "@/types/attendance";

const students = [
  { id: 100, name: "Alice", classId: 1 },
  { id: 101, name: "Bob", classId: 1 },
];

const drafts: AttendanceRecordDraft[] = [
  { studentId: 100, status: "absent" },
  { studentId: 101, status: "present" },
];

function mountRoster(props = { students, modelValue: drafts }) {
  return mount(AttendanceRoster, { props });
}

// ─── Rendering ────────────────────────────────────────────────────────────────

describe("AttendanceRoster — rendering", () => {
  it("renders one row per student", () => {
    const wrapper = mountRoster();
    expect(wrapper.findAll("tbody tr")).toHaveLength(2);
  });

  it("renders each student's name", () => {
    const wrapper = mountRoster();
    const rows = wrapper.findAll("tbody tr");
    expect(rows[0].find(".col-name").text()).toBe("Alice");
    expect(rows[1].find(".col-name").text()).toBe("Bob");
  });

  it("the active badge has the 'active' class", () => {
    const wrapper = mountRoster();
    // Alice's status is "absent" — the Absent badge should be active
    const aliceRow = wrapper.findAll("tbody tr")[0];
    const badges = aliceRow.findAll("button");
    const absent = badges.find((b) => b.text() === "Absent");
    const present = badges.find((b) => b.text() === "Present");
    expect(absent!.classes()).toContain("active");
    expect(present!.classes()).not.toContain("active");
  });
});

// ─── Interaction ──────────────────────────────────────────────────────────────

describe("AttendanceRoster — interaction", () => {
  it("clicking a badge emits update:modelValue with the updated draft", async () => {
    const wrapper = mountRoster();
    // Click "Present" for Alice (studentId 100), who starts as "absent"
    const aliceRow = wrapper.findAll("tbody tr")[0];
    const presentBadge = aliceRow
      .findAll("button")
      .find((b) => b.text() === "Present");
    await presentBadge!.trigger("click");

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toHaveLength(1);
    expect(emitted![0][0]).toEqual([
      { studentId: 100, status: "present" },
      { studentId: 101, status: "present" },
    ]);
  });

  it("does not change other students when one is updated", async () => {
    const wrapper = mountRoster();
    // Click "Late" for Alice — Bob should stay "present"
    const aliceRow = wrapper.findAll("tbody tr")[0];
    const lateBadge = aliceRow
      .findAll("button")
      .find((b) => b.text() === "Late");
    await lateBadge!.trigger("click");

    const emitted = wrapper.emitted(
      "update:modelValue",
    )![0][0] as AttendanceRecordDraft[];
    expect(emitted.find((d) => d.studentId === 101)?.status).toBe("present");
  });
});
