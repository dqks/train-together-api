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

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  exerciseProgressionTypeId: number;

  @IsInt()
  @IsNotEmpty()
  @IsPositive()
  primaryMuscleId: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return [];
    if (typeof value === 'string') return [Number(value)];
    if (Array.isArray(value)) return value.map(Number);
    return [];
  })
  @ArrayMaxSize(5)
  @ArrayMinSize(0)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  secondaryMuscleIds: number[] = [];

  @IsInt()
  @IsNotEmpty()
  equipmentId: number;
}
