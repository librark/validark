import { grab } from './grab.js'

describe('grab', () => {
  it('grabs a key from an object', () => {
    const object = {
      element: 'content'
    }

    const result = grab(object, 'element')

    expect(result).toBe('content')
  })

  it('throws if the key is not found in the object', () => {
    const object = {
      element: 'content'
    }

    expect(() => grab(object, 'missing')).toThrow(
      'Key "missing" not found')
  })

  it('throws an error if the container give is not an object', () => {
    const container = 1

    expect(() => grab(container)).toThrow(
      'Container must be an object. Got "1"')
  })

  it('throws if called without arguments', () => {
    expect(() => grab()).toThrow(
      'Container must be an object. Got "undefined"')
  })

  it('provides a default value if the key is not found', () => {
    const object = {
      element: 'content'
    }

    const result = grab(object, 'missing', 777)

    expect(result).toBe(777)
  })

  it('grabs a class instance if a class is provided as a key', () => {
    class Alpha {}
    class Beta {}

    const object = {
      alpha: new Alpha(),
      Beta: new Beta()
    }

    let value = grab(object, Alpha)
    expect(value instanceof Alpha).toBeTruthy()

    value = grab(object, Beta)
    expect(value instanceof Beta).toBeTruthy()
  })

  it('grabs a key and validates a class is an array is provided', () => {
    class Alpha {}

    const object = {
      resource: new Alpha()
    }

    let value = grab(object, ['resource', Alpha])
    expect(value instanceof Alpha).toBeTruthy()
  })

  it('errors out if the item grabbed is not an instance of the key', () => {
    class Alpha {}
    class Beta {}

    const object = {
      alpha: new Beta(),
      beta: null
    }

    expect(() => grab(object, Alpha)).toThrow(
      'Expecting "Alpha" but got "Beta"')
    expect(() => grab(object, Beta)).toThrow(
      'Expecting "Beta" but got "undefined"')
  })
})
