import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingProgramExercise } from './training-program-exercise.entity';
import { TrainingProgramExercisesService } from './training-program-exercises.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingProgramExercise])],
  providers: [TrainingProgramExercisesService],
})
export class TrainingProgramExercisesModule {}
