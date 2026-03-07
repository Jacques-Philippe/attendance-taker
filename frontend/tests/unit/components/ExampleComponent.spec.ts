import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

// Simple test component for demonstration
const TestComponent = {
  template: `
    <div class="test-component">
      <h1>{{ title }}</h1>
      <p>{{ message }}</p>
      <button @click="count++">Count: {{ count }}</button>
    </div>
  `,
  props: {
    title: {
      type: String,
      default: 'Test Component'
    },
    message: {
      type: String,
      default: 'This is a test component'
    }
  },
  data() {
    return {
      count: 0
    }
  }
}

describe('ExampleComponent', () => {
  it('should render with default props', () => {
    const wrapper = mount(TestComponent)

    expect(wrapper.find('h1').text()).toBe('Test Component')
    expect(wrapper.find('p').text()).toBe('This is a test component')
    expect(wrapper.find('button').text()).toContain('Count: 0')
  })

  it('should render with custom props', () => {
    const wrapper = mount(TestComponent, {
      props: {
        title: 'Custom Title',
        message: 'Custom message'
      }
    })

    expect(wrapper.find('h1').text()).toBe('Custom Title')
    expect(wrapper.find('p').text()).toBe('Custom message')
  })

  it('should increment count when button is clicked', async () => {
    const wrapper = mount(TestComponent)

    expect(wrapper.find('button').text()).toContain('Count: 0')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').text()).toContain('Count: 1')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').text()).toContain('Count: 2')
  })

  it('should have test-component class', () => {
    const wrapper = mount(TestComponent)

    expect(wrapper.find('.test-component').exists()).toBe(true)
  })
})
