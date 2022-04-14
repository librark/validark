import { check, grab } from '../lib/utilities.js'

describe('check', () => {
  it('checks the truthyness of a value', () => {
    const value = 'Truthy Value'

    const result = check(value)

    expect(result).toBe(value)
  })

  it('throws an error if the value provided is not truthy', () => {
    const value = undefined
    const message = 'Invalid value!'

    expect(() => check(value, message)).toThrow(`check failed. ${message}`)
  })

  it('throws if called without arguments', () => {
    expect(() => check()).toThrow('check failed.')
  })
})

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
      'Argument "container" must be an object. Got "1"')
  })

  it('throws if called without arguments', () => {
    expect(() => grab()).toThrow(
      'Argument "container" must be an object. Got "null"')
  })

  it('provides a default value if the key is not found', () => {
    const object = {
      element: 'content'
    }

    const result = grab(object, 'missing', 777)

    expect(result).toBe(777)
  })
})
