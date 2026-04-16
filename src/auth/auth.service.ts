import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { RegistrationDto } from './dto/registration.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import type { Request } from 'express';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}
  async me(req: Request) {
    // @ts-ignore
    const userId = req.user.userId;
    // @ts-ignore
    const userEmail = req.user.email;
    // @ts-ignore
    const userNickname = req.user.nickname;
    return { id: userId, email: userEmail, nickname: userNickname };
  }

  async registration(registrationDto: RegistrationDto) {
    const checkIfEmailUsed = await this.userService.getUserByEmail(
      registrationDto.email,
    );

    if (checkIfEmailUsed) {
      throw new BadRequestException({
        nickname: 'Пользователь с таким email уже существует',
      });
    }

    const checkIfNicknameUsed = await this.userService.getUserByNickname(
      registrationDto.nickname,
    );

    if (checkIfNicknameUsed) {
      throw new BadRequestException({
        nickname: 'Пользователь с таким никнеймом уже существует',
      });
    }

    const user = await this.userService.createUser(registrationDto);
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmail(loginDto.email);

    if (!user) {
      throw new HttpException(
        'Неверная почта или пароль',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const isMatch = await compare(loginDto.password, user?.password);

    if (!isMatch) {
      throw new HttpException(
        'Неверная почта или пароль',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return user;
  }

  public async login(loginDto: LoginDto) {
    // const user = await this.validateUser(loginDto);
    //
    // const payload = { sub: user.id, email: user.email };
    // const token = this.jwtService.sign(payload, { expiresIn: '15m' });
    //
    // res.cookie();
    //
    // return {
    //   id: user.id,
    //   email: user.email,
    // };
  }
}
