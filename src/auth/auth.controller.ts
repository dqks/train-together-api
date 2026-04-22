import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrationDto } from './dto/registration.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import type { CustomRequest } from '../common/types/custom-request';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: CustomRequest) {
    return this.authService.me(req);
  }

  @Post('registration')
  registration(@Body() registrationDto: RegistrationDto) {
    return this.authService.registration(registrationDto);
  }
  //TODO: рефактор, вынос в сервис
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginDto, res);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
    return { message: 'Logged out' };
  }

  @Post('refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const oldToken = req.cookies.access_token;
    const payload = this.jwtService.verify(oldToken, {
      secret: process.env.JWT_SECRET,
      ignoreExpiration: true, // разрешаем expired
    });

    // Создаем новый токен
    const newToken = this.jwtService.sign(
      { sub: payload.sub, email: payload.email },
      { expiresIn: '15m' },
    );

    res.cookie('access_token', newToken, { httpOnly: true });
    return { message: 'Token refreshed' };
  }
}
