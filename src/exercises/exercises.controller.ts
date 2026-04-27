import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CustomRequest } from '../common/types/custom-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterExerciseDto } from './dto/filter-exercise.dto';

@Controller('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get()
  findAll(@Query() filter: FilterExerciseDto) {
    return this.exerciseService.findAllDefault(filter);
  }

  @Get('/my')
  @UseGuards(JwtAuthGuard)
  getMy(@Req() req: CustomRequest) {
    return this.exerciseService.getMy(req);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.exerciseService.findOne(+id, req);
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
