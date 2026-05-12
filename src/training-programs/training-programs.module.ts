import { forwardRef, Module } from '@nestjs/common';
import { TrainingProgramsController } from './training-programs.controller';
import { TrainingProgramsService } from './training-programs.service';
import { TrainingProgram } from './training-program.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { Role } from '../roles/role.entity';
import { TrainingProgramDay } from '../training-program-days/training-program-day.entity';
import { TrainingProgramDaysService } from '../training-program-days/training-program-days.service';
import { TrainingProgramExercise } from '../training-program-exercises/training-program-exercise.entity';
import { ExercisesModule } from '../exercises/exercises.module';
import { Goal } from '../goals/goal.entity';
import { Difficulty } from '../difficulties/difficulty.entity';
import { LikedTrainingPrograms } from '../liked-training-programs/liked-training-program.entity';
import { FollowedTrainingProgram } from '../followed-training-programs/followed-training-programs.entity';
import { AppService } from '../app.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrainingProgram,
      User,
      Role,
      TrainingProgramDay,
      TrainingProgramExercise,
      Goal,
      Difficulty,
      LikedTrainingPrograms,
      FollowedTrainingProgram,
    ]),
    forwardRef(() => ExercisesModule),
  ],
  controllers: [TrainingProgramsController],
  providers: [
    TrainingProgramsService,
    UsersService,
    RolesService,
    TrainingProgramDaysService,
    AppService,
  ],
  exports: [TrainingProgramsService],
})
export class TrainingProgramsModule {}
