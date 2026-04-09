// Alexsander Xavier - 4338139
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';

export type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'GERENTE_REGIONAL' | 'CLIENTE';

export class RegisterDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(['ADMIN', 'FUNCIONARIO', 'GERENTE_REGIONAL', 'CLIENTE'])
  perfil: UserRole;

  @IsOptional()
  unidadeId?: string;

  @IsOptional()
  regiaoId?: string;

  @IsOptional()
  consentimento?: boolean;

  // código administrativo (somente para perfis ADMIN)
  @IsOptional()
  @IsString()
  codigo?: string;
}
