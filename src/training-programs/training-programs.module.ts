import { Module } from '@nestjs/common';
import { TrainingProgramsController } from './training-programs.controller';
import { TrainingProgramsService } from './training-programs.service';
import { TrainingProgram } from './training-program.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingProgram])],
  controllers: [TrainingProgramsController],
  providers: [TrainingProgramsService],
})
export class TrainingProgramsModule {}
