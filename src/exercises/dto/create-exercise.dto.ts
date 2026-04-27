import {
  ArrayMaxSize,
  ArrayMinSize,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly name: string;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  exerciseProgressionTypeId: number;

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  primaryMuscleId: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string' && value.includes(',')) {
      return value
        .split(',')
        .map((v) => parseInt(v, 10))
        .filter((v) => !isNaN(v));
    }
    if (typeof value === 'string') {
      return [parseInt(value, 10)].filter((v) => !isNaN(v));
    }
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(v, 10));
    }
    return [];
  })
  @ArrayMaxSize(5)
  @ArrayMinSize(0)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  secondaryMuscleIds: number[] = [];

  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @IsNotEmpty()
  equipmentId: number;
}
