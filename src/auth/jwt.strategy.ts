import { Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

export type JwtPayload = {
  sub: number;
  email: string;
  nickname: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // @ts-ignore
    super({
      jwtFromRequest: (req) => {
        return req?.cookies?.access_token;
      },
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      nickname: payload.nickname,
    };
  }
}
