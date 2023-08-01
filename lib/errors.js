export class ValidarkError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
  }
}

export class ValidationError extends ValidarkError {}

export class CheckError extends ValidarkError {}

export class GrabError extends ValidarkError {}

export class NeedError extends ValidarkError {}
