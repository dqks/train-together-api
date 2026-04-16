export interface UserPayload {
  userId: number;
  email: string;
  nickname: string;
}

export interface CustomRequest extends Request {
  user: UserPayload;
}
