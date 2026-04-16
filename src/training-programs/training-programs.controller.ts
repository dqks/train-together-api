import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { TrainingProgram } from './training-program.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import type { CustomRequest } from '../common/types/custom-request';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(private trainingProgramService: TrainingProgramsService) {}

  @Get()
  getAllPublicTrainingPrograms(): Promise<TrainingProgram[]> {
    return this.trainingProgramService.getAllPublicTrainingPrograms();
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  getMyTrainingPrograms(@Req() req: CustomRequest): Promise<TrainingProgram[]> {
    return this.trainingProgramService.getMyTrainingPrograms(req);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createTrainingProgram(
    @Body() createProgramDto: CreateProgramDto,
    @Req() req: CustomRequest,
  ) {
    return this.trainingProgramService.createTrainingProgram(
      createProgramDto,
      req,
    );
  }
}
