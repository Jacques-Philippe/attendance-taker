import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ClassManagementView from "@/views/ClassManagementView.vue";
import { makeRouter } from "../../utils";

const { mockFetchClasses, mockCreateClass, mockDeleteClass } = vi.hoisted(
  () => ({
    mockFetchClasses: vi.fn(),
    mockCreateClass: vi.fn(),
    mockDeleteClass: vi.fn(),
  }),
);

const classes = [
  { id: 1, name: "Math", period: "1st", teacherId: 10 },
  { id: 2, name: "English", period: "2nd", teacherId: 10 },
];

vi.mock("@/stores/classes", () => ({
  useClassesStore: () => ({
    classes,
    currentClass: null,
    error: null,
    fetchClasses: mockFetchClasses,
    fetchClass: vi.fn(),
    createClass: mockCreateClass,
    updateClass: vi.fn(),
    deleteClass: mockDeleteClass,
    addStudent: vi.fn(),
    updateStudent: vi.fn(),
    removeStudent: vi.fn(),
  }),
}));

function mountView() {
  return mount(ClassManagementView, {
    global: {
      plugins: [
        makeRouter({ path: "/classes", component: ClassManagementView }),
      ],
    },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreateClass.mockResolvedValue(undefined);
  mockDeleteClass.mockResolvedValue(undefined);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

// ─── Rendering ───────────────────────────────────────────────────────────────

describe("ClassManagementView — rendering", () => {
  it("renders a row for each class in the store", () => {
    const wrapper = mountView();
    const rows = wrapper.findAll(".class-row");
    expect(rows).toHaveLength(2);
  });

  it("renders class names and periods", () => {
    const wrapper = mountView();
    expect(wrapper.find(".class-name").text()).toBe("Math");
    expect(wrapper.find(".class-period").text()).toBe("1st");
  });

  it("calls fetchClasses on mount", () => {
    mountView();
    expect(mockFetchClasses).toHaveBeenCalledOnce();
  });
});

// ─── Delete ───────────────────────────────────────────────────────────────────

describe("ClassManagementView — delete", () => {
  it("calls deleteClass with the correct id when Delete is confirmed", async () => {
    const wrapper = mountView();
    const deleteButtons = wrapper.findAll("button.danger");
    await deleteButtons[0].trigger("click");
    expect(mockDeleteClass).toHaveBeenCalledOnce();
    expect(mockDeleteClass).toHaveBeenCalledWith(classes[0].id);
  });

  it("does not call deleteClass when the confirmation is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(false);
    const wrapper = mountView();
    const deleteButtons = wrapper.findAll("button.danger");
    await deleteButtons[0].trigger("click");
    expect(mockDeleteClass).not.toHaveBeenCalled();
  });
});

// ─── New class form ───────────────────────────────────────────────────────────

describe("ClassManagementView — new class form", () => {
  it("shows the form after clicking '+ New class'", async () => {
    const wrapper = mountView();
    expect(wrapper.find(".inline-form").exists()).toBe(false);
    await wrapper.find("button.btn-primary").trigger("click");
    expect(wrapper.find(".inline-form").exists()).toBe(true);
  });

  it("calls createClass with name and period on submit", async () => {
    const wrapper = mountView();
    await wrapper.find("button.btn-primary").trigger("click");

    const inputs = wrapper.find(".inline-form").findAll("input");
    await inputs[0].setValue("Science");
    await inputs[1].setValue("3rd");
    await wrapper.find(".inline-form").trigger("submit");

    expect(mockCreateClass).toHaveBeenCalledOnce();
    expect(mockCreateClass).toHaveBeenCalledWith({
      name: "Science",
      period: "3rd",
    });
  });

  it("hides the form after successful submit", async () => {
    const wrapper = mountView();
    await wrapper.find("button.btn-primary").trigger("click");

    const inputs = wrapper.find(".inline-form").findAll("input");
    await inputs[0].setValue("Science");
    await inputs[1].setValue("3rd");
    await wrapper.find(".inline-form").trigger("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".inline-form").exists()).toBe(false);
  });
});
