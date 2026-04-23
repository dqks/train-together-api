import { Module } from '@nestjs/common';
import { TrainingProgramsController } from './training-programs.controller';
import { TrainingProgramsService } from './training-programs.service';
import { TrainingProgram } from './training-program.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingProgram, User, Role])],
  controllers: [TrainingProgramsController],
  providers: [TrainingProgramsService, UsersService, RolesService],
})
export class TrainingProgramsModule {}
