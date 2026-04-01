export class ApiResponse<T = any> {
  resultCode: number;
  messages: Record<string, string[]> | string[];
  data: T | null;

  constructor(
    data?: T,
    messages?: Record<string, string[]> | string[],
    resultCode: number = 0,
  ) {
    this.resultCode = resultCode;
    this.messages = messages || [];
    this.data = data ?? null;
  }

  static success<T>(data?: T, messages?: string[]): ApiResponse<T> {
    return new ApiResponse(data, messages || [], 0);
  }

  static error(
    messages: Record<string, string[]> | string[],
    resultCode: number = 400,
  ): ApiResponse<null> {
    return new ApiResponse(null, messages, resultCode);
  }
}
