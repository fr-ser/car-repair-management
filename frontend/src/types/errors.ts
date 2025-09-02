// custom errors

export class RequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestError';
  }
}
