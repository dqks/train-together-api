import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CustomRequest } from '../common/types/custom-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get()
  findAll() {
    return this.exerciseService.findAllDefault();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createExercise(
    @Body() createExerciseDto: CreateExerciseDto,
    @Req() req: CustomRequest,
  ) {
    return this.exerciseService.createExercise(createExerciseDto, req);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteExercise(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.exerciseService.deleteExercise(+id, req);
  }
}
