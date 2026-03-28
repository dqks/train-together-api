import { Module } from '@nestjs/common';
import { ExercisesMusclesController } from './exercises-muscles.controller';
import { ExercisesMusclesService } from './exercises-muscles.service';

@Module({
  controllers: [ExercisesMusclesController],
  providers: [ExercisesMusclesService],
})
export class ExercisesMusclesModule {}
