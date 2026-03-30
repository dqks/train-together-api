import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';

//TODO выполнить работу с хешированным паролем
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService
      ) {}

    async signIn(email: string, pass: string): Promise<any> {
      const user = await this.userRepository.findOneBy({ email });
      if (user?.password !== pass) {
        throw new UnauthorizedException();
      }
      const payload = { sub: user.id, email: user.email };
      return {
        // 💡 Here the JWT secret key that's used for signing the payload 
        // is the key that was passed in the JwtModule
        access_token: await this.jwtService.signAsync(payload),
      };
    }
}
