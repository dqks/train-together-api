import { Controller, Get } from '@nestjs/common';
import { ExerciseTypesService } from './exercise-types.service';

@Controller('exercise-types')
export class ExerciseTypesController {
  constructor(private exerciseTypeService: ExerciseTypesService) {}

  @Get()
  getAll() {
    return this.exerciseTypeService.getAll();
  }
}
