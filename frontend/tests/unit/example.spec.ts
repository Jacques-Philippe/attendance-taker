import { describe, it, expect } from 'vitest'

describe('Example Unit Test', () => {
  it('should add two numbers correctly', () => {
    const result = 2 + 3
    expect(result).toBe(5)
  })

  it('should concatenate strings', () => {
    const greeting = 'Hello' + ' ' + 'World'
    expect(greeting).toBe('Hello World')
  })

  it('should handle arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
  })

  it('should handle objects', () => {
    const user = {
      name: 'John',
      role: 'teacher',
      email: 'john@example.com'
    }

    expect(user).toHaveProperty('name')
    expect(user.role).toBe('teacher')
  })

  it('should throw an error for invalid input', () => {
    const divide = (a: number, b: number) => {
      if (b === 0) {
        throw new Error('Division by zero')
      }
      return a / b
    }

    expect(() => divide(10, 0)).toThrow('Division by zero')
  })
})
