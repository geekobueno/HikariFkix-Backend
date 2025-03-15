export class ApiResponse {
  constructor(success, data = null, message = "", statusCode = 200) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = "Success") {
    return new ApiResponse(true, data, message);
  }

  static error(message = "Error", statusCode = 500, data = null) {
    return new ApiResponse(false, data, message, statusCode);
  }
}
