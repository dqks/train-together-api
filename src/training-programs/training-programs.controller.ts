import { Controller, Get } from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { TrainingProgram } from './training-programs.entity';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(private trainingProgramService: TrainingProgramsService) {}

  @Get()
  getAllPublicTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.trainingProgramService.getAllPublicTrainingPrograms();
  }
}
