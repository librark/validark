<p align="center">
  <a href="https://codecov.io/gh/librark/validark">
    <img src="https://codecov.io/gh/librark/validark/graph/badge.svg?token=Ad3rGVvNuu"/>
  </a>
</p>
<p align="center">
  <a href="https://codecov.io/gh/librark/validark">
    <img src="https://codecov.io/gh/librark/validark/graphs/sunburst.svg?token=Ad3rGVvNuu"/>
  </a>
</p>

# Validarkjs

Simple data validation and utility library.

## Installation

```bash
npm install @knowark/validarkjs
```

## Exports

```js
import {
  Abstract,
  Interactor,
  Query,
  cache,
  Cacher,
  check,
  fallible,
  format,
  dedent,
  outdent,
  grab,
  has,
  merge,
  need,
  stringify,
  structure,
  validate
} from '@knowark/validarkjs'
```

## Validation

Use `validate(schema, instance, options?)` to validate and transform data.

```js
import { validate } from '@knowark/validarkjs'

const schema = {
  '*name': String,
  age: parseInt
}

const result = validate(schema, { name: 'Ada', age: '37' })
// { name: 'Ada', age: 37 }
```

### Schema rules

- Schema values can be:
  - validation functions (for scalars)
  - nested schema objects
  - arrays with one validator/schema for item validation
- Prefix a key with `*` to make it required.
- Use `:=` to define aliases. The output key is the left-most alias.
- Alias matching is evaluated right-to-left when multiple aliases are present.

```js
const schema = {
  '*first_name:=firstname:=firstName': String,
  '*score:=totalScore:=points': parseInt,
  contact: {
    '*email': String
  },
  tags: [String],
  addresses: [{ '*street': String, city: String }]
}
```

### Options

`validate(..., options)` supports:

- `strict` (`boolean`, default `false`):
  - `false`: unknown properties are ignored
  - `true`: unknown properties are reported as errors
- `eager` (`boolean`, default `false`):
  - `false`: collect all issues and throw one aggregate error
  - `true`: throw on the first issue found
- `dialect` (`string`):
  - `'jsonschema'`: use the JSON Schema validator instead of default function-schema validation

### JSON Schema dialect

When `dialect: 'jsonschema'` is used, `validate()` validates against a JSON Schema
and returns the original instance (without value transformation).

```js
const schema = {
  type: 'object',
  properties: { age: { type: 'number' } }
}

validate(schema, { age: 33 }, { dialect: 'jsonschema' })
// { age: 33 }
```

### Error behavior

Default mode is non-eager (`eager: false`), so all issues are collected.

```js
const schema = { '*name': String, '*age': parseInt }

try {
  validate(schema, [{ age: 'young' }])
} catch (error) {
  // error is AggregateError
  // error.name === 'ValidationError'
  // error.issues is an array of issue objects
  console.log(error.message)
}
```

Use eager mode to fail fast:

```js
validate(schema, [{ age: 'young' }], { eager: true })
// throws first validation error
```

Validation functions can:

- return transformed values
- return an `Error` object
- throw an `Error`

In non-eager mode, returned/thrown errors are included in the collected issues.

### Arrays and nested schemas

```js
const schema = {
  levels: [parseInt],
  contact: {
    '*phone': String
  }
}

const records = [{ levels: ['1', '2'], contact: { phone: 123456 } }]
const [result] = validate(schema, records)
// { levels: [1, 2], contact: { phone: '123456' } }
```

## Utilities

### `check(value, options?)`

- Returns `value` if valid.
- Throws `CheckError` if value is falsy.
- If `options.type` is provided, validates that type.

```js
import { check } from '@knowark/validarkjs'

check('ok')
check(42, { type: Number })
```

### `grab(container, key, fallback?)`

Retrieves a value from an object.

- `key` can be a string
- `key` can be a class constructor (tries `camelCaseName` then `ClassName`)
- `key` can be `[name, Class]`

```js
import { grab } from '@knowark/validarkjs'

const value = grab({ element: 'content' }, 'element')
const fallback = grab({}, 'missing', 777)
```

### `has(instance, properties)`

Ensures the instance has the requested truthy properties.

```js
import { has } from '@knowark/validarkjs'

has({ name: 'Ada', age: 37 }, ['name', 'age'])
```

### `need(type, fallback)`

Returns `fallback` if it matches the expected type, otherwise throws `NeedError`.

```js
import { need } from '@knowark/validarkjs'

const value = need(String, 'default')
```

### `fallible(promise)`

Wraps a promise and returns `[error, result]`.

```js
import { fallible } from '@knowark/validarkjs'

const [error, result] = await fallible(Promise.resolve(123))
```

### `merge(first, second)`

Deep-merges plain object branches recursively.

```js
import { merge } from '@knowark/validarkjs'

const merged = merge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
// { a: 1, b: { c: 2, d: 3 } }
```

### `format`, `dedent`, `outdent`

```js
import { format, dedent, outdent } from '@knowark/validarkjs'

format('${name} is ${age}', { name: 'Ada', age: 37 })
dedent('  a\n    b')
outdent('    a\n    b')
```

### `stringify(structure, format?)`

- default: `String(structure)`
- `'json'`: `JSON.stringify`
- `'graphql'` / `'gql'`: GraphQL-like serialization

```js
import { stringify } from '@knowark/validarkjs'

stringify({ hello: 'world' }, 'json')
```

### `structure(object, format?)`

- Clones JS objects/arrays into plain data
- Parses GraphQL source strings into structure objects when format is `'graphql'`/`'gql'`, or when source starts with `query`, `mutation`, or `subscription`

```js
import { structure } from '@knowark/validarkjs'

const data = structure({ a: 1 })
```

### `cache(target, options?)`

Caches async function/object method results.

- Works for async functions and async object methods
- Supports `size`, `lifetime`, `methods`, and custom `cacher`
- Exposes `Cacher` abstract interface

```js
import { cache } from '@knowark/validarkjs'

const cachedFetch = cache(async (id) => ({ id }))
await cachedFetch(1)
```

## OOP helpers

### `Abstract`

Base class for abstract hierarchies. Prevents direct instantiation and provides `abstract(...)` helper.

### `Interactor`

Use for input/output validated workflows.

```js
import { Interactor } from '@knowark/validarkjs'

class CreateUser extends Interactor {
  schema = {
    input: { '*name': String },
    output: { '*id': String, '*name': String }
  }

  async perform (input) {
    return { id: 'u1', name: input.name }
  }
}
```

### `Query`

Specialized `Interactor` with a `properties` attribute defaulting to `null`.

## License

MIT
