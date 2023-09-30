import { validate } from './validate/index.js'
import { Abstract } from './abstract.js'

export class Interactor extends Abstract {
  schema = {
    input: null,
    output: null
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
    const inputSchema = this.schema.input
    const validated = inputSchema ? this.validator(inputSchema, input) : input
    const result = await this.perform(validated)
    const outputSchema = this.schema.output
    return outputSchema ? this.validator(outputSchema, result) : result
  }

  async perform (/** @type {object} */ input) {
    return this.abstract(input, Object)
  }
}
