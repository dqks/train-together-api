import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CustomRequest } from '../common/types/custom-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get()
  findAll() {
    return this.exerciseService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createExercise(
    @Body() createExerciseDto: CreateExerciseDto,
    @Req() req: CustomRequest,
  ) {
    return this.exerciseService.createExercise(createExerciseDto, req);
  }
}
