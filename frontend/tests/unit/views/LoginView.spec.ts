import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import LoginView from "@/views/LoginView.vue";

describe("LoginView", () => {
  it("renders the app title", () => {
    const wrapper = mount(LoginView);
    expect(wrapper.find("h1").text()).toBe("Attendance Taker");
  });

  it("renders a username input", () => {
    const wrapper = mount(LoginView);
    const input = wrapper.find('input[type="text"]#username');
    expect(input.exists()).toBe(true);
    expect(input.attributes("autocomplete")).toBe("username");
    expect(input.attributes("required")).toBeDefined();
  });

  it("renders a password input", () => {
    const wrapper = mount(LoginView);
    const input = wrapper.find('input[type="password"]#password');
    expect(input.exists()).toBe(true);
    expect(input.attributes("autocomplete")).toBe("current-password");
    expect(input.attributes("required")).toBeDefined();
  });

  it("renders a submit button", () => {
    const wrapper = mount(LoginView);
    const button = wrapper.find('button[type="submit"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe("Sign In");
  });

  it("updates username ref when typing", async () => {
    const wrapper = mount(LoginView);
    const input = wrapper.find("#username");
    await input.setValue("teacher1");
    expect((input.element as HTMLInputElement).value).toBe("teacher1");
  });

  it("updates password ref when typing", async () => {
    const wrapper = mount(LoginView);
    const input = wrapper.find("#password");
    await input.setValue("s3cr3t");
    expect((input.element as HTMLInputElement).value).toBe("s3cr3t");
  });

  it("does not throw when the form is submitted", async () => {
    const wrapper = mount(LoginView);
    await wrapper.find("#username").setValue("teacher1");
    await wrapper.find("#password").setValue("s3cr3t");
    await expect(wrapper.find("form").trigger("submit")).resolves.not.toThrow();
  });
});
