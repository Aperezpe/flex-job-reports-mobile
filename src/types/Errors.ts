export class AppError extends Error {
  title = "";
  constructor(title: string, message: string) {
    super(message);
    this.name = 'CompanyError';
    this.title = title;

    // Set the prototype explicitly (needed for instanceof checks to work in some environments)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}