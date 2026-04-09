// Alexsander Xavier - 4338139
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const { user, params, body, query } = request;
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado');
    }

    // Validação de acesso à região
    // regionId pode estar em params, body ou query
    const regionId = params?.regionId || body?.regionId || query?.regionId;
    if (regionId) {
      // PrismaClient import lazy para evitar dependência circular
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const regiao = await prisma.regiao.findUnique({
        where: { id: regionId },
      });
      if (!regiao || !regiao.ativo) {
        throw new ForbiddenException('Região não encontrada ou inativa');
      }
      if (user.role === 'GERENTE_REGIONAL' && user.regiaoId !== regionId) {
        throw new ForbiddenException(
          'Gerente Regional só pode acessar sua própria região',
        );
      }
      // ADMIN pode acessar qualquer região
    }
    return true;
  }
}
