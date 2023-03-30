export declare class Cacher {
  get (key: string): Promise<{value?: any, expiration?: number}>

  set (key: string, content: {value: any, expiration?: number}): Promise<void>
}
export declare function cache<Type>(
  target: Type,
  options?: {
    cacher?: Cacher,
    size?: number,
    lifetime?: number,
    methods?: string[]
  }
): Type

export declare function check<Type>(
  value: unknown,
  type: new() => Type
): Type
export declare function check(
  value: unknown,
): unknown

export declare function format(
  template: string,
  variables: object
): string

export declare function dedent(
  input: string
): string

export declare function outdent(
  input: string
): string

export declare function grab<Type>(
  container: unknown,
  key: new() => Type,
  fallback?: Type
): Type
export declare function grab(
  container: unknown,
  key: string,
  fallback?: unknown
): unknown

export declare function stringify(
  structure: object,
  format?: string,
  options?: object
): string

export declare function structure(
  object: object,
): object

export declare function validate(
  schema: object,
  instance: object[],
  options?: {
    dialect?: string
  }
): object[]
export declare function validate(
  schema: object,
  instance: object,
  options?: {
    dialect?: string
  }
): object
