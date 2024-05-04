class ApiResponse {
  constructor(statuscode, data, message = "success") {
    this.statuscode = statuscode;
    this.message = message;
    this.data = data;
    this.sucess = statuscode < 400;
  }
}
