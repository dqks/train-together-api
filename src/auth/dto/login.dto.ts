import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Почта должна быть верного формата' })
  @IsNotEmpty({ message: 'Обязательное поле' })
  readonly email: string;

  @IsString()
  @IsNotEmpty({ message: 'Обязательное поле' })
  readonly password: string;
}
