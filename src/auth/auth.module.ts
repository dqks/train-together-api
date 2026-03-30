import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
      UsersModule,
      TypeOrmModule.forFeature([User]),
      JwtModule.registerAsync({
        imports: [ConfigModule], // Import ConfigModule here if not global
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          global: true,
          secret: config.get("JWT_CONSTANT"),
          signOptions: { expiresIn: '60s' },
        }),
      }),
    ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
