export class AppException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppException';
  }
}

export class NotFoundException extends AppException {
  constructor(message = 'Resource not found') {
    super(404, message);
    this.name = 'NotFoundException';
  }
}

export class ConflictException extends AppException {
  constructor(message: string, errors?: Record<string, string[]>) {
    super(409, message, errors);
    this.name = 'ConflictException';
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'Invalid credentials') {
    super(401, message);
    this.name = 'UnauthorizedException';
  }
}

export class ValidationException extends AppException {
  constructor(errors: Record<string, string[]>) {
    super(400, 'Validation failed', errors);
    this.name = 'ValidationException';
  }
}
