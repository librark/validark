import { has } from './has.js'

describe('has', () => {
  it('returns the given instance if it has the given properties', () => {
    const instance = {
      name: 'John Doe'
    }

    const result = has(instance, 'name')

    expect(result).toBe(instance)
  })

  it('throws if a property is not found in the instance', () => {
    const instance = {
      name: 'John Doe'
    }

    expect(() => has(instance, 'missing')).toThrow(
      'Instance does not have property "missing".')
  })

  it('throws if any property from a list is not found in the instance', () => {
    const instance = {
      name: 'John Doe'
    }

    expect(() => has(instance, ['name', 'age'])).toThrow(
      'Instance does not have property "age".')
  })

  it('throws if any property from a comma separated string is missing', () => {
    const instance = {
      name: 'John Doe'
    }

    expect(() => has(instance, 'name, age')).toThrow(
      'Instance does not have property "age".')
  })
})
