import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TrainingProgramsService } from './training-programs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateProgramDto } from './dto/create-program.dto';
import type { CustomRequest } from '../common/types/custom-request';
import type { Request } from 'express';

@Controller('training-programs')
export class TrainingProgramsController {
  constructor(private trainingProgramService: TrainingProgramsService) {}

  @Get()
  getAllPublicTrainingPrograms() {
    return this.trainingProgramService.getAllPublicTrainingPrograms();
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  getMyTrainingPrograms(@Req() req: CustomRequest) {
    return this.trainingProgramService.getMyTrainingPrograms(req);
  }

  @Get('/favourite')
  @UseGuards(JwtAuthGuard)
  getFavouriteTrainingPrograms(@Req() req: CustomRequest) {
    return this.trainingProgramService.getFavouriteTrainingPrograms(req);
  }

  @Post('/subscribe/:id')
  @UseGuards(JwtAuthGuard)
  subscribeTrainingPrograms(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ) {
    return this.trainingProgramService.subscribeTrainingPrograms(+id, req);
  }

  @Delete('/subscribe/:id')
  @UseGuards(JwtAuthGuard)
  unsubscribeTrainingPrograms(
    @Param('id') id: string,
    @Req() req: CustomRequest,
  ) {
    return this.trainingProgramService.unsubscribeTrainingPrograms(+id, req);
  }

  @Get(':id')
  getTrainingProgram(@Param('id') id: string, @Req() req: Request) {
    return this.trainingProgramService.getTrainingProgram(Number(id), req);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteTrainingProgram(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.trainingProgramService.deleteTrainingProgram(+id, req);
  }
}
