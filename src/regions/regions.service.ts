// Alexsander Xavier - 4338139
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class RegionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}
  async create(dto: CreateRegionDto, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode criar região');
    const region = await this.prisma.regiao.create({
      data: { nome: dto.nome, createdAt: new Date(), updatedAt: new Date() },
    });
    await this.auditoria.registrar(
      'CRIAR_REGIAO',
      currentUser.id,
      'Regiao',
      region.id,
    );
    return region;
  }

  async findAll(page = 1, limit = 10) {
    const [regions, total] = await Promise.all([
      this.prisma.regiao.findMany({
        where: {},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.regiao.count(),
    ]);
    return { data: regions, total, page, limit };
  }
  async findById(id: string) {
    const region = await this.prisma.regiao.findUnique({ where: { id } });
    if (!region) throw new NotFoundException('Região não encontrada');
    return region;
  }

  async update(id: string, dto: UpdateRegionDto, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode editar região');
    const region = await this.prisma.regiao.findUnique({ where: { id } });
    if (!region) throw new NotFoundException('Região não encontrada');
    const updated = await this.prisma.regiao.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
    await this.auditoria.registrar(
      'EDITAR_REGIAO',
      currentUser.id,
      'Regiao',
      id,
    );
    return updated;
  }

  async softDelete(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode desativar região');
    const region = await this.prisma.regiao.findUnique({ where: { id } });
    if (!region) throw new NotFoundException('Região não encontrada');
    const unidades = await this.prisma.unidade.findMany({
      where: { regiaoId: id /*ativo: true*/ },
    });
    if (unidades.length > 0)
      throw new BadRequestException(
        'Não é possível desativar região com unidades vinculadas',
      );
    const updated = await this.prisma.regiao.update({
      where: { id },
      data: { ativo: false, updatedAt: new Date() },
    });
    await this.auditoria.registrar(
      'DESATIVAR_REGIAO',
      currentUser.id,
      'Regiao',
      id,
    );
    return updated;
  }

  // Para indicadores: buscar todas as unidades de uma região
  async getUnitsByRegion(regionId: string) {
    const region = await this.prisma.regiao.findUnique({
      where: { id: regionId },
    });
    if (!region || region.ativo === false)
      throw new NotFoundException('Região inativa ou não encontrada');
    return this.prisma.unidade.findMany({
      where: { regiaoId: regionId /*ativo: true*/ },
    });
  }

  // Para indicadores: validar se gerente pertence à região
  async validateManagerRegionAccess(userId: string, regionId: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
    });
    if (
      !user ||
      user.perfil !== 'GERENTE_REGIONAL' ||
      user.regiaoId !== regionId
    ) {
      throw new ForbiddenException('Acesso negado à região');
    }
    const region = await this.prisma.regiao.findUnique({
      where: { id: regionId },
    });
    if (!region || region.ativo === false)
      throw new ForbiddenException('Região inativa ou não encontrada');
    return true;
  }
}
