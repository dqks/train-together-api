import { IsEnum, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum Goals {
  MASS = 'mass',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  ATHLETICISM = 'athleticism',
  OTHER = 'other',
}

export enum Difficulties {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum SortOptions {
  POPULAR = 'popular',
  NEW = 'new',
}

export class FilterProgramDto {
  @IsOptional()
  @IsEnum(Goals)
  goal?: Goals;

  @IsOptional()
  @IsEnum(Difficulties)
  difficulty?: Difficulties;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1, { message: 'Минимум 1 день' })
  @Max(7, { message: 'Максимум 7 дней' })
  frequency?: number;

  @IsOptional()
  @IsEnum(SortOptions)
  sortOption?: SortOptions;
}
