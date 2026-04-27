import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import type { CustomRequest } from '../common/types/custom-request';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FilterExerciseDto } from './dto/filter-exercise.dto';
import { createImageInterceptor } from '../common/interceptors/image.interceptor';

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
  @UseInterceptors(createImageInterceptor('exercises'))
  // @UseGuards(JwtAuthGuard)
  createExercise(
    @Body() createExerciseDto: CreateExerciseDto,
    @Req() req: CustomRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/exercises/${file.filename}` : null;

    return this.exerciseService.createExercise(
      createExerciseDto,
      req,
      imagePath,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteExercise(@Param('id') id: string, @Req() req: CustomRequest) {
    return this.exerciseService.deleteExercise(+id, req);
  }
}
