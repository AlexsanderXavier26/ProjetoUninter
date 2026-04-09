// Alexsander Xavier - 4338139
import { IsEnum } from 'class-validator';

enum PerfilType {
  ADMIN = 'ADMIN',
  GERENTE_REGIONAL = 'GERENTE_REGIONAL',
  FUNCIONARIO = 'FUNCIONARIO',
  CLIENTE = 'CLIENTE',
}

export class UpdateRoleDto {
  @IsEnum(PerfilType)
  role: string;
}
