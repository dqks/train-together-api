import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class DayExerciseDto {
  @IsInt()
  @IsPositive({ message: 'ID положительное' })
  exerciseId: number;

  @IsInt()
  @IsPositive({ message: 'Положительное число' })
  @Max(10)
  sets: number;

  @IsInt()
  @IsPositive({ message: 'Положительное число' })
  @Max(50)
  reps: number;

  @IsInt()
  @Min(0)
  @Max(14, { message: 'Максимум 15 упражнений' })
  exerciseOrder: number;
}

class ProgramDetailsItemDto {
  @IsInt()
  @IsPositive({ message: 'ID положительное' })
  dayId: number;

  @ValidateIf((object, value) => value == true)
  @IsString({ message: 'Тип string' })
  @MaxLength(50, { message: 'Максимум 50 символов' })
  name: string;

  @ValidateIf((object, value) => value == true)
  @IsString({ message: 'Тип string' })
  @MaxLength(2500, { message: 'Максимум 2500 символов' })
  description: string;

  @IsArray()
  @ArrayMaxSize(15)
  @ValidateNested({ each: true })
  @Type(() => DayExerciseDto)
  exercises: DayExerciseDto[];
}

export class AddTrainingProgramDetailsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProgramDetailsItemDto)
  details: ProgramDetailsItemDto[];
}
