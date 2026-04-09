// Alexsander Xavier - 4338139
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class AuditoriaService {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(
    acao: string,
    usuarioId: string,
    entidade: string,
    entidadeId: string,
    detalhes?: string,
  ) {
    await this.prisma.auditoria.create({
      data: {
        acao,
        usuarioId,
        entidade,
        entidadeId,
        detalhes,
      },
    });
  }
}
