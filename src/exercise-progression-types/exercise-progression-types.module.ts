import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseProgressionType } from './exercise-progression-type.entity';
import { ExerciseProgressionTypesController } from './exercise-progression-types.controller';
import { ExerciseProgressionTypesService } from './exercise-progression-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseProgressionType])],
  controllers: [ExerciseProgressionTypesController],
  providers: [ExerciseProgressionTypesService],
})
export class ExerciseProgressionTypesModule {}
