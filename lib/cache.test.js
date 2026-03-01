import assert from 'node:assert/strict'
import { it } from 'node:test'
import { isProxy } from 'util/types'
import { cache, Cacher } from './cache.js'

it('decorates the given function', async () => {
    const original = async (first, second, third) => {
      return first + second + third
    }

    const cached = cache(original)

    assert.deepStrictEqual(cached.constructor.name, 'AsyncFunction')
    assert.deepStrictEqual(await cached(1, 2, 3), 6)
  })

it('cache: exports a cacher interface', async () => {
  const cacher = new Cacher()

  await assert.rejects(cacher.remove(), { message: 'Not implemented.' })
  await assert.rejects(cacher.add(
    'foo', { value: true }), { message: 'Not implemented.' })
})

it('does not cache numbers, booleans or strings primitives', () => {
    assert.deepStrictEqual(cache(5), 5)
    assert.deepStrictEqual(cache('hello'), 'hello')
    assert.deepStrictEqual(cache(true), true)
  })

it('caches the results of a function based on its arguments', async () => {
    const calls = []
    const original = async (first, second, third) => {
      calls.push(true)
      return first + second + third
    }

    const cached = cache(original)

    assert.deepStrictEqual(await cached(1, 2, 3), 6)
    assert.deepStrictEqual(await cached(1, 2, 3), 6)
    assert.deepStrictEqual(await cached(1, 2, 3), 6)
    assert.deepStrictEqual(calls.length, 1)
  })

it('does not cache synchronous functions', async () => {
    const calls = []
    const original = (first, second, third) => {
      calls.push(true)
      return first + second + third
    }

    const cached = cache(original)

    assert.deepStrictEqual(await cached(1, 2, 3), 6)
    assert.deepStrictEqual(await cached(1, 2, 3), 6)
    assert.deepStrictEqual(await cached(1, 2, 3), 6)
    assert.deepStrictEqual(calls.length, 3)
  })

it('returns a proxy object wrapping the one given', () => {
    const original = {
      async booleanMethod () {
        return true
      }
    }

    const cached = cache(original)

    assert.strictEqual(isProxy(cached), true)
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

    assert.deepStrictEqual(cached.stringMethod(), 'String Method')
    assert.strictEqual(await cached.booleanMethod(), true)
    assert.strictEqual(await cached.booleanMethod(), true)
    assert.strictEqual(await cached.booleanMethod(), true)
    assert.deepStrictEqual(calls.length, 1)
  })

it('caches a callable results for a certain time', async () => {
    const calls = []
    const original = {
      attribute: 'string',
      async add ({ first, second, third }) {
        calls.push({ first, second, third })
        return { data: first + second + third }
      }
    }

    const cached = cache(original, { lifetime: 100 })

    assert.deepStrictEqual(cached.attribute, 'string')
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(calls.length, 1)

    await new Promise(resolve => setTimeout(resolve, 150))

    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })

    assert.deepStrictEqual(calls.length, 2)

    await new Promise(resolve => setTimeout(resolve, 150))

    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })
    assert.deepStrictEqual(await cached.add({ first: 3, second: 4, third: 5 }), 
      { data: 12 })

    assert.deepStrictEqual(calls.length, 3)
  })

it('caches only the given methods list if provided', async () => {
    const alphaCalls = []
    const betaCalls = []
    const original = {
      attribute: 'string',
      async alpha () {
        alphaCalls.push(true)
        return 'alpha'
      },
      async beta () {
        betaCalls.push(true)
        return 'beta'
      }
    }

    const cached = cache(original, { methods: ['alpha'] })

    assert.strictEqual(await cached.alpha(), 'alpha')
    assert.strictEqual(await cached.alpha(), 'alpha')
    assert.strictEqual(await cached.alpha(), 'alpha')
    assert.deepStrictEqual(alphaCalls.length, 1)

    assert.strictEqual(await cached.beta(), 'beta')
    assert.strictEqual(await cached.beta(), 'beta')
    assert.strictEqual(await cached.beta(), 'beta')
    assert.deepStrictEqual(betaCalls.length, 3)
  })

it('has a size equal to the last recently used entries', async () => {
    const calls = []
    const original = {
      async add ({ first, second, third }) {
        calls.push({ first, second, third })
        return { data: first + second + third }
      }
    }

    const cached = cache(original, { size: 2 })

    assert.deepStrictEqual(await cached.add({ first: 1, second: 2, third: 3 }), 
      { data: 6 })
    assert.deepStrictEqual(await cached.add({ first: 1, second: 2, third: 3 }), 
      { data: 6 })
    assert.deepStrictEqual(await cached.add({ first: 4, second: 5, third: 6 }), 
      { data: 15 })
    assert.deepStrictEqual(await cached.add({ first: 7, second: 8, third: 9 }), 
      { data: 24 })
    assert.deepStrictEqual(await cached.add({ first: 1, second: 2, third: 3 }), 
      { data: 6 })
    assert.deepStrictEqual(await cached.add({ first: 1, second: 2, third: 3 }), 
      { data: 6 })
    assert.deepStrictEqual(calls.length, 4)
  })

it('uses an asynchronous lock to prevent race conditions', async () => {
    const calls = []
    const original = async (first, second, third) => {
      calls.push(true)
      return first + second + third
    }

    const cached = cache(original)
    const promises = [
      cached(1, 2, 3),
      cached(1, 2, 3),
      cached(1, 2, 3)
    ]

    assert.deepStrictEqual(await Promise.all(promises), 
      [6, 6, 6]
    )
    assert.deepStrictEqual(calls.length, 1)
  })
