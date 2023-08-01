import { NeedError } from './errors.js'
import { need } from './need.js'

describe('need', () => {
  it('throws a NeedError when called', () => {
    expect(() => need(Number)).toThrow(NeedError)
    expect(() => need(Number)).toThrow('A value of type "Number" is needed.')
  })

  it('returns the provided fallback as a default value', () => {
    expect(need(String, 'Hello World')).toEqual('Hello World')
    expect(need(Number, 77)).toEqual(77)
    expect(need(Date, new Date('2023-08-01'))).toEqual(new Date('2023-08-01'))
  })

  it('throws if the  the provided fallback is not a instance of type', () => {
    expect(() => need(Date, 'Tuesday Afternoon')).toThrow(NeedError)
    expect(() => need(Date, 'Tuesday Afternoon')).toThrow(
      'The fallback value must be of type "Date". Got "String".')
  })

  it('returns the provided fallback if it is a subclass of type', () => {
    class BaseClass {}
    class SubClass extends BaseClass {}

    const instance = new SubClass()

    expect(need(BaseClass, instance)).toEqual(instance)
    expect(need(SubClass, instance)).toEqual(instance)
  })

  it('may be used to ensure required parameters are provided', () => {
    function sum (first = need(Number), second = need(Number)) {
      return first + second
    }

    expect(sum(1, 2)).toEqual(3)
    expect(() => sum(1)).toThrow('A value of type "Number" is needed.')
  })
})
