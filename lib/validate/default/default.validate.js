import { ValidationError } from '../../common/errors.js'

const invalid = Symbol('invalid')
const additionalPropertiesMessage = 'Additional properties where received.'

/** @param {Object} schema
 * @param {Array[Object] | Object} records
 * @param {{strict?: boolean, abortEarly?: boolean}} options
 * @return {Array[Object] | Object}
 * */
export function validateDefault (
  schema,
  records,
  { strict = false, abortEarly = true } = {}
) {
  const isObject = records?.constructor === Object
  const values = isObject ? [records] : records
  if (!Array.isArray(values)) {
    const error = new ValidationError(
      'The validate function requires an array or object satisfying the ' +
      `schema with keys [${Object.keys(schema)}]. Got "${records}".`)
    if (abortEarly) {
      throw error
    }
    throw createAggregateError([
      createIssue(error, {
        code: 'invalid_record_collection',
        path: []
      })
    ])
  }

  const context = { strict, abortEarly, issues: [] }
  const result = validateRecords(schema, values, context, [])
  if (!abortEarly && context.issues.length) {
    throw createAggregateError(context.issues)
  }

  return isObject ? result.pop() : result
}

/**
 * @param {Object} schema
 * @param {Array[Object]} records
 * @param {{strict: boolean, abortEarly: boolean, issues: object[]}} context
 * @param {(number|string)[]} path
 * @return {Array[Object]}
 */
function validateRecords (schema, records, context, path, includeIndex = true) {
  const result = []
  const fields = parseSchemaFields(schema)

  for (const [index, record] of records.entries()) {
    const recordPath = includeIndex ? path.concat(index) : path
    if (!isPlainObject(record)) {
      reportIssue(
        new ValidationError(
          `Record "${index}" is not an object. Got "${record}".`),
        context,
        { code: 'invalid_record', path: recordPath }
      )
      continue
    }

    if (context.strict) {
      for (const key of Object.keys(record)) {
        if (fields.allowedKeys.has(key)) {
          continue
        }

        reportIssue(new Error(additionalPropertiesMessage), context, {
          code: 'additional_properties',
          path: recordPath.concat(key),
          received: key
        })
      }
    }

    const item = {}
    for (const field of fields.entries) {
      const value = getSchemaValue(record, field.aliases)
      if (field.required && typeof value === 'undefined') {
        reportIssue(
          new ValidationError(`The field "${field.key}" is required.`),
          context,
          { code: 'required', path: recordPath.concat(field.key) }
        )
        continue
      }

      if (typeof value === 'undefined') {
        continue
      }

      const output = validateSchemaValue(
        field.validator,
        value,
        context,
        field.key,
        recordPath.concat(field.key)
      )

      if (output !== invalid) {
        item[field.key] = output
      }
    }
    result.push(item)
  }

  return result
}

/**
 * @param {Function|Object|Array} validator
 * @param {any} value
 * @param {{strict: boolean, abortEarly: boolean, issues: object[]}} context
 * @param {string} key
 * @param {(number|string)[]} path
 * @return {any}
 */
function validateSchemaValue (validator, value, context, key, path) {
  if (Array.isArray(value)) {
    const arrayValidator = Array.isArray(validator) ? validator[0] : validator
    if (isSchemaObject(arrayValidator)) {
      return validateRecords(arrayValidator, value, context, path)
    }

    return value
      .map((item, index) => validateCallable(
        arrayValidator,
        item,
        context,
        key,
        path.concat(index)
      ))
      .filter(item => item !== invalid)
  }

  if (isSchemaObject(validator)) {
    const output = validateRecords(validator, [value], context, path, false)
    return output.shift()
  }

  return validateCallable(validator, value, context, key, path)
}

/**
 * @param {Function} validator
 * @param {any} value
 * @param {{strict: boolean, abortEarly: boolean, issues: object[]}} context
 * @param {string} key
 * @param {(number|string)[]} path
 * @return {any}
 */
function validateCallable (validator, value, context, key, path) {
  let outcome
  try {
    outcome = validator(value)
  } catch (error) {
    reportIssue(error, context, { code: 'validator_exception', path, value })
    return invalid
  }

  if (Number.isNaN(outcome)) {
    reportIssue(
      new ValidationError(
        `The field "${key}" must be a number. Got "${value}".`),
      context,
      { code: 'nan', path, value }
    )
    return invalid
  }

  if (outcome instanceof Error) {
    reportIssue(outcome, context, { code: 'validator_error', path, value })
    return invalid
  }

  return outcome
}

/**
 * @param {Object} schema
 * @return {{ entries: Array<{ required: boolean, key: string, aliases: string[], validator: any }>, allowedKeys: Set<string> }}
 */
function parseSchemaFields (schema) {
  const allowedKeys = new Set()
  const entries = Object.entries(schema).map(([field, validator]) => {
    const required = field[0] === '*'
    const aliases = (required ? field.slice(1) : field).split(':=')
    aliases.forEach(key => allowedKeys.add(key))
    return {
      required,
      key: aliases[0],
      aliases,
      validator
    }
  })

  return { entries, allowedKeys }
}

/**
 * @param {Object} record
 * @param {string[]} aliases
 * @return {any}
 */
function getSchemaValue (record, aliases) {
  let value
  for (const alias of aliases.slice().reverse()) {
    if (typeof record[alias] !== 'undefined') {
      value = record[alias]
    }
  }
  return value
}

/**
 * @param {Error} error
 * @param {{strict: boolean, abortEarly: boolean, issues: object[]}} context
 * @param {{code: string, path: (number|string)[], value?: any, received?: any}} meta
 * @return {void}
 */
function reportIssue (error, context, meta) {
  if (context.abortEarly) {
    throw error
  }
  context.issues.push(createIssue(error, meta))
}

/**
 * @param {Error} error
 * @param {{code: string, path: (number|string)[], value?: any, received?: any}} meta
 * @return {{ code: string, path: (number|string)[], message: string, value?: any, received?: any, error: Error }}
 */
function createIssue (error, meta) {
  return {
    ...meta,
    message: error.message,
    error
  }
}

/**
 * @param {Array<{path: (number|string)[], message: string, error: Error}>} issues
 * @return {AggregateError}
 */
function createAggregateError (issues) {
  const message = issues
    .map((issue) => {
      const pointer = issue.path.length ? `${formatPath(issue.path)}: ` : ''
      return pointer + issue.message
    })
    .join('\n')

  const error = new AggregateError(
    issues.map(issue => issue.error),
    `ValidationError\n\n${message}`
  )
  error.name = 'ValidationError'
  error.issues = issues
  return error
}

/**
 * @param {(number|string)[]} path
 * @return {string}
 */
function formatPath (path) {
  let pointer = '$'
  for (const segment of path) {
    if (typeof segment === 'number') {
      pointer += `[${segment}]`
    } else if (/^[A-Za-z_$][\w$]*$/.test(segment)) {
      pointer += `.${segment}`
    } else {
      pointer += `["${String(segment).replace(/"/g, '\\"')}"]`
    }
  }
  return pointer
}

/**
 * @param {any} value
 * @return {boolean}
 */
function isPlainObject (value) {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

/**
 * @param {any} value
 * @return {boolean}
 */
function isSchemaObject (value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
