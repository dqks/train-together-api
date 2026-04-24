import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingProgramDay } from './training-program-day.entity';
import { TrainingProgramDaysService } from './training-program-days.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingProgramDay])],
  providers: [TrainingProgramDaysService],
})
export class TrainingProgramDaysModule {}
