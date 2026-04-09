// Alexsander Xavier - 4338139
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsBoolean,
  IsDateString,
} from 'class-validator';

enum PerfilType {
  ADMIN = 'ADMIN',
  GERENTE_REGIONAL = 'GERENTE_REGIONAL',
  FUNCIONARIO = 'FUNCIONARIO',
  CLIENTE = 'CLIENTE',
}

export class CreateUserDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  senha: string;

  @IsEnum(PerfilType)
  perfil: string;

  @IsOptional()
  unidadeId?: string;

  @IsOptional()
  regiaoId?: string;

  @IsOptional()
  @IsBoolean()
  consentimentoLGPD?: boolean;

  @IsOptional()
  @IsDateString()
  dataConsentimento?: string;
}
