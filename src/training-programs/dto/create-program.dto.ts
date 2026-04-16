import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2500)
  readonly description: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly isPublic: string;

  // @IsString()
  // @IsEmpty()
  // readonly image: string;
}
