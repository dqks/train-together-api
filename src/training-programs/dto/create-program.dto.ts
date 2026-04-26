import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateProgramDto {
  @IsString()
  @IsNotEmpty({ message: 'Обязательное поле' })
  @MinLength(5, { message: 'Минимум 5 символов' })
  @MaxLength(30, { message: 'Максимум 30 символов' })
  readonly name: string;

  @ValidateIf((object, value) => value == true)
  @IsString()
  @MinLength(5, { message: 'Минимум 5 символов' })
  @MaxLength(2500, { message: 'Максимум 2500 символов' })
  readonly description: string;

  @IsBoolean()
  @IsNotEmpty({ message: 'Обязательное поле' })
  readonly isPublic: string;
}
