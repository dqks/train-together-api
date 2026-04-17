import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExerciseType } from './exercise-type.entity';
import { ExerciseTypesController } from './exercise-types.controller';
import { ExerciseTypesService } from './exercise-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([ExerciseType])],
  controllers: [ExerciseTypesController],
  providers: [ExerciseTypesService],
})
export class ExerciseTypesModule {}
