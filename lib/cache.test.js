import { isProxy } from 'util/types'
import { cache, Storer, MemoryStorer } from './cache.js'

describe('cache', () => {
  it('decorates the given function', async () => {
    const original = async (first, second, third) => {
      return first + second + third
    }

    const cached = cache(original)

    expect(cached.constructor.name).toEqual('AsyncFunction')
    expect(await cached(1, 2, 3)).toEqual(6)
  })

  it('exports an Storer interface', async () => {
    const storer = new Storer()

    await expect(storer.get('foo')).rejects.toThrow('Not implemented.')
    await expect(storer.set('foo', { value: true })).rejects.toThrow('Not implemented.')
  })

  it('provides a MemoryStore storer implementation', async () => {
    const storer = new MemoryStorer()
    
    await storer.set('one', { value: 1 })

    expect(await storer.get('one')).toEqual({ value: 1 })
  })

  it('does not cache numbers, booleans or strings primitives', () => {
    expect(cache(5)).toEqual(5)
    expect(cache('hello')).toEqual('hello')
    expect(cache(true)).toEqual(true)
  })

  it('caches the results of a function based on its arguments', async () => {
    const calls = []
    const original = async (first, second, third) => {
      calls.push(true)
      return first + second + third
    }

    const cached = cache(original)

    expect(await cached(1, 2, 3)).toEqual(6)
    expect(await cached(1, 2, 3)).toEqual(6)
    expect(await cached(1, 2, 3)).toEqual(6)
    expect(calls.length).toEqual(1)
  })

  it('does not cache synchronous functions', async () => {
    const calls = []
    const original = (first, second, third) => {
      calls.push(true)
      return first + second + third
    }

    const cached = cache(original)

    expect(await cached(1, 2, 3)).toEqual(6)
    expect(await cached(1, 2, 3)).toEqual(6)
    expect(await cached(1, 2, 3)).toEqual(6)
    expect(calls.length).toEqual(3)
  })

  it('returns a proxy object wrapping the one given', () => {
    const original = {
      async booleanMethod () {
        return true
      }
    }

    const cached = cache(original)

    expect(isProxy(cached)).toBe(true)
  })

  it("caches all object's methods by default", async () => {
    const calls = []
    const original = {
      attribute: 'string',
      async booleanMethod () {
        calls.push(true)
        return true
      },
      stringMethod () {
        return 'String Method'
      }
    }

    const cached = cache(original)

    expect(cached.stringMethod()).toEqual('String Method')
    expect(await cached.booleanMethod()).toBe(true)
    expect(await cached.booleanMethod()).toBe(true)
    expect(await cached.booleanMethod()).toBe(true)
    expect(calls.length).toEqual(1)
  })

  it("caches a callable results for a certain time", async () => {
    const calls = []
    const original = {
      attribute: 'string',
      async add ({ first, second, third }) {
        calls.push({ first, second, third })
        return { data: first + second + third }
      }
    }

    const cached = cache(original, { lifetime: 100 })

    expect(cached.attribute).toEqual('string')
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(calls.length).toEqual(1)

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })

    expect(calls.length).toEqual(2)

    await new Promise(resolve => setTimeout(resolve, 150))

    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })
    expect(await cached.add({
      first: 3, second: 4, third: 5 })).toEqual({ data: 12 })

    expect(calls.length).toEqual(3)
  })
})
