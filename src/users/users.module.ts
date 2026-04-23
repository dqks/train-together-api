import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { RolesService } from '../roles/roles.service';
import { RolesModule } from '../roles/roles.module';
import { Role } from '../roles/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    forwardRef(() => AuthModule),
    RolesModule,
  ],
  providers: [UsersService, RolesService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
