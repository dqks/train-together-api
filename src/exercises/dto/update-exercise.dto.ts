import { CreateExerciseDto } from './create-exercise.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateExerciseDto extends PartialType(CreateExerciseDto) {}
