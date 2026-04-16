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
// import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request) {
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
    const user = await this.authService.validateUser(loginDto);

    const payload = {
      sub: user.id,
      email: user.email,
      nickname: user.nickname,
    };
    const token = this.jwtService.sign(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 15 * 1000 * 60,
    });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
    };
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
