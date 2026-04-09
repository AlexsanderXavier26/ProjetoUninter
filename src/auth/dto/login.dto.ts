// Alexsander Xavier - 4338139
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  // código extra necessário para administração
  @IsOptional()
  @IsString()
  codigo?: string;
}
