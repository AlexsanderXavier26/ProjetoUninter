// Alexsander Xavier - 4338139
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class UnitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}
  async create(dto: CreateUnitDto, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode criar unidade');
    // Região deve existir e estar ativa
    const regiao = await this.prisma.regiao.findUnique({
      where: { id: dto.regiaoId },
    });
    if (!regiao || regiao.ativo === false)
      throw new BadRequestException('Região inválida ou inativa');
    const unit = await this.prisma.unidade.create({
      data: {
        nome: dto.nome,
        regiaoId: dto.regiaoId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    await this.auditoria.registrar(
      'CRIAR_UNIDADE',
      currentUser.id,
      'Unidade',
      unit.id,
    );
    return unit;
  }

  async findAll(page = 1, limit = 10) {
    const [units, total] = await Promise.all([
      this.prisma.unidade.findMany({
        where: {},
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.unidade.count(),
    ]);
    return { data: units, total, page, limit };
  }
  async findById(id: string) {
    const unit = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unidade não encontrada');
    return unit;
  }

  async update(id: string, dto: UpdateUnitDto, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode editar unidade');
    const unit = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unidade não encontrada');
    // Se for trocar de região, validar nova região
    if (dto.regiaoId) {
      const regiao = await this.prisma.regiao.findUnique({
        where: { id: dto.regiaoId },
      });
      if (!regiao || regiao.ativo === false)
        throw new BadRequestException('Nova região inválida ou inativa');
    }
    const updated = await this.prisma.unidade.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
    await this.auditoria.registrar(
      'EDITAR_UNIDADE',
      currentUser.id,
      'Unidade',
      id,
    );
    return updated;
  }

  async softDelete(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode desativar unidade');
    const unit = await this.prisma.unidade.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException('Unidade não encontrada');
    // Não pode desativar se houver funcionários ativos
    const funcionarios = await this.prisma.usuario.findMany({
      where: { unidadeId: id, perfil: 'FUNCIONARIO', ativo: true },
    });
    if (funcionarios.length > 0)
      throw new BadRequestException('Unidade possui funcionários ativos');
    // Não pode desativar se houver pedidos ativos
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        unidadeId: id,
        status: { in: ['CRIADO', 'AGUARDANDO_PAGAMENTO', 'PAGO'] },
      },
    });
    if (pedidos.length > 0)
      throw new BadRequestException('Unidade possui pedidos ativos');
    const updated = await this.prisma.unidade.update({
      where: { id },
      data: { ativo: false, updatedAt: new Date() },
    });
    await this.auditoria.registrar(
      'DESATIVAR_UNIDADE',
      currentUser.id,
      'Unidade',
      id,
    );
    return updated;
  }
}
