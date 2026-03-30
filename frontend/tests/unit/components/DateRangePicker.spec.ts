import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DateRangePicker from "@/components/DateRangePicker.vue";
import { makeI18n } from "../../utils";

const initial = { from: "2026-01-01", to: "2026-01-31" };

function mountPicker() {
  return mount(DateRangePicker, {
    props: { modelValue: initial },
    global: { plugins: [makeI18n()] },
  });
}

describe("DateRangePicker — rendering", () => {
  it("renders two date inputs", () => {
    const wrapper = mountPicker();
    expect(wrapper.findAll('input[type="date"]')).toHaveLength(2);
  });
});

describe("DateRangePicker — interaction", () => {
  it("changing 'from' emits update:modelValue with new from; to unchanged", async () => {
    const wrapper = mountPicker();
    const inputs = wrapper.findAll('input[type="date"]');
    await inputs[0].setValue("2026-02-01");

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toHaveLength(1);
    expect((emitted![0][0] as { from: string; to: string }).from).toBe(
      "2026-02-01",
    );
    expect((emitted![0][0] as { from: string; to: string }).to).toBe(
      initial.to,
    );
  });

  it("changing 'to' emits update:modelValue with new to; from unchanged", async () => {
    const wrapper = mountPicker();
    const inputs = wrapper.findAll('input[type="date"]');
    await inputs[1].setValue("2026-03-31");

    const emitted = wrapper.emitted("update:modelValue");
    expect(emitted).toHaveLength(1);
    expect((emitted![0][0] as { from: string; to: string }).to).toBe(
      "2026-03-31",
    );
    expect((emitted![0][0] as { from: string; to: string }).from).toBe(
      initial.from,
    );
  });
});
