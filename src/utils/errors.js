export class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function notFound(message = "Resource not found") {
  return new AppError(message, 404, "NOT_FOUND");
}

export function forbidden(message = "You do not have access to this resource") {
  return new AppError(message, 403, "FORBIDDEN");
}

export function badRequest(message = "Invalid request") {
  return new AppError(message, 400, "BAD_REQUEST");
}
