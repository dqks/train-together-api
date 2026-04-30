import { IsNumber, IsOptional, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterExerciseDto {
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') return [Number(value)];
    if (Array.isArray(value)) return value.map(Number);
    return [];
  })
  primaryMuscles?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  equipmentId?: number;
}
