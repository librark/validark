/**
 * @param {object|string} object
 * @param {string} format
 * @return {object}
 * */
export function structure (object, format = '') {
  if (isGraphqlSource(object, format)) {
    return parseGraphql(object)
  }
  return JSON.parse(JSON.stringify(object))
}

function isGraphqlSource (object, format) {
  if (typeof object !== 'string') {
    return false
  }
  if (['graphql', 'gql'].includes(format)) {
    return true
  }

  return !format && /^\s*(query|mutation|subscription)\b/.test(object)
}

function parseGraphql (source) {
  const parser = createParser(source)
  const document = {}

  while (parser.hasMore()) {
    const { key, value } = parser.parseDefinition()
    document[key] = value
  }

  return document
}

function createParser (source) {
  let index = 0

  return {
    hasMore,
    parseDefinition
  }

  function hasMore () {
    skipIgnored()
    return index < source.length
  }

  function parseDefinition () {
    const key = parseName()
    const value = {}

    if (isOperationType(key) && isNameStart(peek())) {
      value.__name = parseName()
    }

    const arguments_ = parseArguments()
    if (arguments_) {
      value.__arguments = arguments_
    }

    Object.assign(value, parseSelectionSet())
    return { key, value }
  }

  function parseSelectionSet () {
    eat('{')
    const fields = {}

    while (!eat('}')) {
      const { key, value } = parseField()
      fields[key] = value
    }

    return fields
  }

  function parseField () {
    const first = parseName()
    let key = first

    if (eat(':')) {
      key = `${first}: ${parseName()}`
    }

    const arguments_ = parseArguments()

    if (peek() === '{') {
      const value = parseSelectionSet()
      if (arguments_) {
        return { key, value: { __arguments: arguments_, ...value } }
      }
      return { key, value }
    }

    if (arguments_) {
      return { key, value: { __arguments: arguments_ } }
    }

    return { key, value: true }
  }

  function parseArguments () {
    if (!eat('(')) {
      return null
    }

    const arguments_ = {}
    while (!eat(')')) {
      const key = parseName()
      eat(':')
      arguments_[key] = parseValue()
    }

    return Object.keys(arguments_).length ? arguments_ : null
  }

  function parseValue () {
    const char = peek()

    if (char === '"') {
      return parseString()
    }

    if (char === '[') {
      return parseList()
    }

    if (char === '{') {
      return parseObject()
    }

    if (char === '-' || isDigit(char)) {
      return parseNumber()
    }

    const value = parseName()
    if (value === 'true') {
      return true
    }
    if (value === 'false') {
      return false
    }
    if (value === 'null') {
      return null
    }
    return value
  }

  function parseString () {
    eat('"')
    let value = ''

    while (source[index] !== '"') {
      if (source[index] === '\\') {
        value += decodeEscape(source[index + 1])
        index += 2
      } else {
        value += source[index]
        index += 1
      }
    }

    eat('"')
    return value
  }

  function parseList () {
    eat('[')
    const value = []

    while (!eat(']')) {
      value.push(parseValue())
    }

    return value
  }

  function parseObject () {
    eat('{')
    const value = {}

    while (!eat('}')) {
      const key = parseName()
      eat(':')
      value[key] = parseValue()
    }

    return value
  }

  function parseNumber () {
    let value = ''

    if (peek() === '-') {
      value += source[index]
      index += 1
    }

    while (isDigit(source[index])) {
      value += source[index]
      index += 1
    }

    if (source[index] === '.') {
      value += source[index]
      index += 1
      while (isDigit(source[index])) {
        value += source[index]
        index += 1
      }
    }

    return Number(value)
  }

  function parseName () {
    skipIgnored()

    let value = ''
    while (isNamePart(source[index])) {
      value += source[index]
      index += 1
    }

    return value
  }

  function eat (char) {
    skipIgnored()
    if (source[index] === char) {
      index += 1
      return true
    }

    return false
  }

  function peek () {
    skipIgnored()
    return source[index]
  }

  function skipIgnored () {
    while (index < source.length) {
      const char = source[index]
      if (char === ',' || /\s/.test(char)) {
        index += 1
        continue
      }

      if (char === '#') {
        while (index < source.length && source[index] !== '\n') {
          index += 1
        }
        continue
      }

      break
    }
  }
}

function decodeEscape (char) {
  return {
    '\\': '\\',
    '"': '"',
    '/': '/',
    b: '\b',
    f: '\f',
    n: '\n',
    r: '\r',
    t: '\t'
  }[char] ?? char
}

function isOperationType (value) {
  return ['query', 'mutation', 'subscription'].includes(value)
}

function isDigit (value) {
  return /[0-9]/.test(value ?? '')
}

function isNameStart (value) {
  return /[A-Za-z_$]/.test(value ?? '')
}

function isNamePart (value) {
  return /[A-Za-z0-9_$]/.test(value ?? '')
}
