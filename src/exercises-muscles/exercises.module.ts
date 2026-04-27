import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseMuscle } from '../exercises-muscles/exercise-muscle.entity';
import { ExercisesMusclesService } from './exercises-muscles.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseMuscle])],
  providers: [ExercisesMusclesService],
})
export class ExercisesModule {}
