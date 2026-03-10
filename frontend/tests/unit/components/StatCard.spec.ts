import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import StatCard from "@/components/StatCard.vue";

describe("StatCard — rendering", () => {
  it("renders the label", () => {
    const wrapper = mount(StatCard, {
      props: { label: "Total Sessions", value: 5 },
    });
    expect(wrapper.text()).toContain("Total Sessions");
  });

  it("renders a numeric value", () => {
    const wrapper = mount(StatCard, {
      props: { label: "Sessions", value: 12 },
    });
    expect(wrapper.text()).toContain("12");
  });

  it("renders a string value", () => {
    const wrapper = mount(StatCard, { props: { label: "Rate", value: "87%" } });
    expect(wrapper.text()).toContain("87%");
  });
});
