export interface ApiResponse<T = any> {
  resultCode: number;
  messages: Record<string, string[]> | string[];
  data: T | null;
}
