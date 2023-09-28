import { validate } from './validate/index.js'
import { Abstract } from './abstract.js'

export class Interactor extends Abstract {
  schema = {
    input: {},
    output: {}
  }

  constructor ({ validator = validate } = {}) {
    super()
    this.validator = validator
    const prototype = Object.getPrototypeOf(this.constructor)
    if (prototype === Interactor) {
      throw new Error('Interactor classes must be extended.')
    }
  }

  async execute (/** @type {object} */ input) {
    const validated = this.validator(this.schema.input, input)
    const result = await this.perform(validated)
    return this.validator(this.schema.output, result)
  }

  async perform (/** @type {object} */ input) {
    return this.abstract(input, Object)
  }
}
