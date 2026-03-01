import assert from 'node:assert/strict'
import { it } from 'node:test'
import { Abstract } from './abstract.js'

it('Abstract: throws if tried to be instantiated directly', () => {
  assert.throws(() => new Abstract(), {
    message: 'The "Abstract" class should be extended by custom abstract classes.'
  })
})

it('Abstract: throws if one of its direct subclasses is instantiated', () => {
  class CustomAbstract extends Abstract {}

  assert.throws(() => new CustomAbstract(), {
    message: 'Abstract class "CustomAbstract" should be implemented by concrete classes.'
  })
})

it('Abstract: allows its concrete subclasses to be instantiated', () => {
  class CustomAbstract extends Abstract {}
  class Concrete extends CustomAbstract {}

  const concrete = new Concrete()

  assert.ok(concrete)
})

it('Abstract: provides a utilitarian method named "abstract" which throws', () => {
  class CustomAbstract extends Abstract {
    customMethod (first, second) {
      this.abstract({ first, second })
    }

    emptyMethod () {
      this.abstract()
    }
  }
  class Concrete extends CustomAbstract {}

  const concrete = new Concrete()

  assert.throws(() => concrete.customMethod(1, 2), {
    message: 'Abstract method. "Concrete.customMethod(first, second)" has not been implemented.'
  })
  assert.throws(() => concrete.emptyMethod(), {
    message: 'Abstract method. "Concrete.emptyMethod()" has not been implemented.'
  })
})

it('Abstract: has an "abstract" method printing the return type given', () => {
  class CustomAbstract extends Abstract {
    customMethod (first, second) {
      this.abstract({ first, second }, Number)
    }

    emptyMethod () {
      this.abstract()
    }

    arrayMethod (first, second) {
      this.abstract([['first', first], ['second', second]], Number)
    }
  }
  class Concrete extends CustomAbstract {}

  const concrete = new Concrete()

  assert.throws(() => concrete.customMethod(1, 2), {
    message: 'Abstract method. "Concrete.customMethod(first, second) : Number" has not been implemented.'
  })
  assert.throws(() => concrete.emptyMethod(), {
    message: 'Abstract method. "Concrete.emptyMethod()" has not been implemented.'
  })
  assert.throws(() => concrete.arrayMethod(1, 2), {
    message: 'Abstract method. "Concrete.arrayMethod(first, second) : Number" has not been implemented.'
  })
})
