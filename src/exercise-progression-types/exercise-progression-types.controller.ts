import { Controller, Get } from '@nestjs/common';
import { ExerciseProgressionTypesService } from './exercise-progression-types.service';

@Controller('exercise-progression-types')
export class ExerciseProgressionTypesController {
  constructor(private exerciseTypeService: ExerciseProgressionTypesService) {}

  @Get()
  getAll() {
    return this.exerciseTypeService.getAll();
  }
}
