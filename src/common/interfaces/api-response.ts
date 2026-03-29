export class ApiResponse<T> {
  resultCode: number;
  messages: string[];
  data: T | null;

  constructor(data?: T, messages: string[] = [], resultCode: number = 0) {
    this.resultCode = resultCode;
    this.messages = messages;
    this.data = data ?? null;
  }

  static success<T>(data?: T, messages: string[] = []) {
    return new ApiResponse(data, messages, 0);
  }
  static error(messages: string[] = [], resultCode: number = 400) {
    return new ApiResponse(null, messages, resultCode);
  }
}
