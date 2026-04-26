import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { RegistrationDto } from './dto/registration.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { CustomRequest } from '../common/types/custom-request';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async me(req: CustomRequest) {
    const userId = req.user.userId;
    const userEmail = req.user.email;
    const userNickname = req.user.nickname;
    return { id: userId, email: userEmail, nickname: userNickname };
  }

  async registration(registrationDto: RegistrationDto) {
    const checkIfEmailUsed = await this.userService.getUserByEmail(
      registrationDto.email,
    );

    if (checkIfEmailUsed) {
      throw new BadRequestException({
        nickname: ['Пользователь с таким email уже существует'],
      });
    }

    const checkIfNicknameUsed = await this.userService.getUserByNickname(
      registrationDto.nickname,
    );

    if (checkIfNicknameUsed) {
      throw new BadRequestException({
        nickname: ['Пользователь с таким никнеймом уже существует'],
      });
    }

    await this.userService.createUser(registrationDto);
    return { success: true };
    // return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  async validateUser(loginDto: LoginDto) {
    const user = await this.userService.getUserByEmail(loginDto.email);

    if (!user) {
      throw new BadRequestException({
        status: ['Неверная почта или пароль'],
      });
    }

    const isMatch = await compare(loginDto.password, user?.password);

    if (!isMatch) {
      throw new BadRequestException({
        status: ['Неверная почта или пароль'],
      });
    }

    return user;
  }

  public async login(loginDto: LoginDto, res: Response) {
    const user = await this.validateUser(loginDto);

    const payload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_SECRET'),
    });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };
  }
}
