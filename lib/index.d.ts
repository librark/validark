export declare function check<Type>(
  value: Type,
  message: string
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
  container: object,
  key: typeof Type,
  fallback: Type
): Type
export declare function grab(
  container: object,
  key: string,
  fallback: unknown
): object

export declare function stringify(
  structure: object,
  format: string = '',
  options: object = null
): string

export declare function validate(
  schema: object,
  records: object
): object
export declare function validate(
  schema: object,
  records: object[]
): object[]
