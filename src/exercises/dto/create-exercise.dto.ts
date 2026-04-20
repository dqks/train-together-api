import {
  IsEmpty,
  IsInt,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateExerciseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly name: string;

  @IsInt()
  @IsNotEmpty()
  exerciseProgressionTypeId: number;

  @IsInt()
  @IsNotEmpty()
  primaryMuscleId: number;

  @IsInt()
  @IsEmpty()
  secondaryMuscleId: number;

  @IsInt()
  @IsNotEmpty()
  equipmentId: number;
}
