// Alexsander Xavier - 4338139

type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'GERENTE_REGIONAL' | 'CLIENTE';

export class JwtPayloadDto {
  id: string;
  role: UserRole;
  regiaoId?: string;
  unidadeId?: string;
}
