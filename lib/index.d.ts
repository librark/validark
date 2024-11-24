export declare abstract class Abstract {
  protected abstract<Type>(
    parameters: {[key: string]: any} | any[],
    returnType: new(...args: any[]) => Type): Type
  protected abstract(
    parameters: {[key: string]: any} | any[]): void
}

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
  options: {
    type: new(...args: any[]) => Type,
    message?: string
  }
): Type
export declare function check(
  value: unknown,
  options?: {
    type?: string,
    message?: string
  }
): unknown

export declare function fallible<Type>(
  promise: Promise<Type>,
): Promise<[Error?, Type?]>

export declare function need<Type>(
  type: new(...args: any[]) => Type,
  fallback?: Type,
): Type

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
  key: new(...args: any[]) => Type,
  fallback?: Type
): Type
export declare function grab(
  container: unknown,
  key: string,
  fallback?: unknown
): unknown

export declare function has<Type>(
  instance: Type,
  properties: string | string[]
): Type

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
  instance: any[],
  options?: {
    dialect?: string,
    strict?: boolean
  }
): any[]
export declare function validate(
  schema: object,
  instance: any,
  options?: {
    dialect?: string,
    strict?: boolean
  }
): any

export declare function merge(
  first: object,
  second: object,
): object

export declare abstract class Interactor {
  schema: {
    input?: any,
    output?: any
  }

  constructor (dependencies?: { validator?: Function })

  execute (input?: any): Promise<any>

  perform (input?: any): Promise<any>
}

export declare abstract class Query extends Interactor {
  properties?: object
}
