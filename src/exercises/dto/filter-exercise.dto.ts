import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterExerciseDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  primaryMuscles?: number[];

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value.map(Number) : [Number(value)];
  })
  equipment?: number[];
}
