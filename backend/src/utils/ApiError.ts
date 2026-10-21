/** An error we throw on purpose, with the HTTP status code to send back. */
export class ApiError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
  static badRequest(message = "درخواست نامعتبر است") {
    return new ApiError(400, message);
  }
  static unauthorized(message = "برای ادامه باید وارد حساب کاربری شوید") {
    return new ApiError(401, message);
  }
  static forbidden(message = "شما اجازهٔ دسترسی به این بخش را ندارید") {
    return new ApiError(403, message);
  }
  static notFound(message = "مورد درخواستی پیدا نشد") {
    return new ApiError(404, message);
  }
  static conflict(message = "این مورد قبلاً ثبت شده است") {
    return new ApiError(409, message);
  }
}
