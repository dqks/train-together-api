import { Module } from '@nestjs/common';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseType } from '../exercise-types/exercise-type.entity';
import { ExerciseTypesService } from '../exercise-types/exercise-types.service';
import { MusclesService } from '../muscles/muscles.service';
import { Muscle } from '../muscles/muscle.entity';
import { ExerciseMuscle } from '../exercises-muscles/exercise-muscle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Exercise, ExerciseType, Muscle, ExerciseMuscle]),
  ],
  controllers: [ExercisesController],
  providers: [ExercisesService, ExerciseTypesService, MusclesService],
})
export class ExercisesModule {}
