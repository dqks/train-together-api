import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegistrationDto {
  @IsEmail({}, { message: 'Почта должна быть верного формата' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Никнейм обязателен' })
  readonly nickname: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(6, { message: 'Длина должна быть минимум 6 символов' })
  readonly password: string;
}
