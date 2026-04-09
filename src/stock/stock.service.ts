// Alexsander Xavier - 4338139
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // Criar registro de estoque (apenas ADMIN)
  async create(dto: CreateStockDto, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode criar estoque');
    // Validar vínculo produto/unidade
    const disponibilidade = await this.prisma.produtoDisponibilidade.findUnique(
      {
        where: {
          produtoId_unidadeId: {
            produtoId: dto.productId,
            unidadeId: dto.unitId,
          },
        },
      },
    );
    if (!disponibilidade || !disponibilidade.disponivel) {
      throw new BadRequestException('Produto não disponível nesta unidade');
    }
    // Não permitir estoque duplicado
    const existente = await this.prisma.estoque.findUnique({
      where: {
        unidadeId_produtoId: {
          unidadeId: dto.unitId,
          produtoId: dto.productId,
        },
      },
    });
    if (existente)
      throw new BadRequestException(
        'Já existe estoque para este produto nesta unidade',
      );
    // Não permitir quantidade negativa
    if (dto.quantidadeAtual < 0 || dto.quantidadeMinima < 0)
      throw new BadRequestException('Quantidade não pode ser negativa');
    const estoque = await this.prisma.estoque.create({
      data: {
        unidadeId: dto.unitId,
        produtoId: dto.productId,
        quantidade: dto.quantidadeAtual,
        reservado: 0,
        quantidadeMinima: dto.quantidadeMinima,
        ativo: dto.ativo !== false,
      },
    });
    await this.auditoria.registrar(
      'CRIAR_ESTOQUE',
      currentUser.id,
      'Estoque',
      estoque.id,
    );
    return estoque;
  }

  // Reserva temporária de estoque para pedido pendente (deve ser chamada no início do fluxo de pedido)
  async reservarEstoque(
    produtoId: string,
    unidadeId: string,
    quantidade: number,
  ) {
    if (quantidade <= 0)
      throw new BadRequestException('Quantidade inválida para reserva');
    return await this.prisma.$transaction(async (tx: any) => {
      const estoque = await tx.estoque.findUnique({
        where: { unidadeId_produtoId: { unidadeId, produtoId } },
      });
      if (!estoque || !estoque.ativo)
        throw new NotFoundException('Estoque não encontrado ou inativo');
      if (estoque.quantidade - estoque.reservado < quantidade)
        throw new BadRequestException('Estoque insuficiente para reserva');
      const updated = await tx.estoque.update({
        where: { unidadeId_produtoId: { unidadeId, produtoId } },
        data: { reservado: { increment: quantidade } },
      });
      return updated;
    });
  }

  // Confirmação de reserva após pagamento aprovado
  async confirmarReserva(
    produtoId: string,
    unidadeId: string,
    quantidade: number,
  ) {
    if (quantidade <= 0)
      throw new BadRequestException('Quantidade inválida para confirmação');
    return await this.prisma.$transaction(async (tx: any) => {
      const estoque = await tx.estoque.findUnique({
        where: { unidadeId_produtoId: { unidadeId, produtoId } },
      });
      if (!estoque || !estoque.ativo)
        throw new NotFoundException('Estoque não encontrado ou inativo');
      if (estoque.reservado < quantidade)
        throw new BadRequestException('Reserva insuficiente para confirmação');
      const updated = await tx.estoque.update({
        where: { unidadeId_produtoId: { unidadeId, produtoId } },
        data: {
          reservado: { decrement: quantidade },
          quantidade: { decrement: quantidade },
        },
      });
      return updated;
    });
  }

  // Rollback de reserva (ex: pagamento falhou ou pedido cancelado)
  async cancelarReserva(
    produtoId: string,
    unidadeId: string,
    quantidade: number,
  ) {
    if (quantidade <= 0)
      throw new BadRequestException('Quantidade inválida para rollback');
    return await this.prisma.$transaction(async (tx: any) => {
      const estoque = await tx.estoque.findUnique({
        where: { unidadeId_produtoId: { unidadeId, produtoId } },
      });
      if (!estoque || !estoque.ativo)
        throw new NotFoundException('Estoque não encontrado ou inativo');
      if (estoque.reservado < quantidade)
        throw new BadRequestException('Reserva insuficiente para cancelar');
      const updated = await tx.estoque.update({
        where: { unidadeId_produtoId: { unidadeId, produtoId } },
        data: { reservado: { decrement: quantidade } },
      });
      return updated;
    });
  }

  // Listar estoques (ADMIN/FUNCIONARIO: todos, GERENTE_REGIONAL: só da sua região)
  async findAll(currentUser: any, page = 1, limit = 10) {
    const where: any = { ativo: true };
    if (currentUser.role === 'GERENTE_REGIONAL') {
      if (!currentUser.regiaoId)
        throw new ForbiddenException('Sem região vinculada');
      // Buscar unidades da região
      const unidades = await this.prisma.unidade.findMany({
        where: { regiaoId: currentUser.regiaoId },
      });
      where.unidadeId = { in: unidades.map((u: any) => u.id) };
    }
    const [data, total] = await Promise.all([
      this.prisma.estoque.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { unidade: true, produto: true },
      }),
      this.prisma.estoque.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  // Listar estoque por unidade
  async findByUnit(unitId: string, currentUser: any, page = 1, limit = 10) {
    // GERENTE_REGIONAL só pode ver da sua região
    if (currentUser.role === 'GERENTE_REGIONAL') {
      const unidade = await this.prisma.unidade.findUnique({
        where: { id: unitId },
      });
      if (!unidade || unidade.regiaoId !== currentUser.regiaoId) {
        throw new ForbiddenException('Acesso negado à unidade');
      }
    }
    const [data, total] = await Promise.all([
      this.prisma.estoque.findMany({
        where: { unidadeId: unitId, ativo: true },
        skip: (page - 1) * limit,
        take: limit,
        include: { unidade: true, produto: true },
      }),
      this.prisma.estoque.count({ where: { unidadeId: unitId, ativo: true } }),
    ]);
    return { data, total, page, limit };
  }

  // Atualizar estoque (FUNCIONARIO pode atualizar quantidade, ADMIN pode tudo)
  async update(id: string, dto: UpdateStockDto, currentUser: any) {
    const estoque = await this.prisma.estoque.findUnique({ where: { id } });
    if (!estoque || !estoque.ativo)
      throw new NotFoundException('Estoque não encontrado ou inativo');
    // FUNCIONARIO só pode atualizar quantidade
    if (currentUser.role === 'FUNCIONARIO') {
      if (dto.quantidadeAtual === undefined)
        throw new ForbiddenException(
          'FUNCIONARIO só pode atualizar quantidade',
        );
      // Validar vínculo unidade
      if (estoque.unidadeId !== currentUser.unidadeId)
        throw new ForbiddenException('Acesso negado à unidade');
      if (dto.quantidadeAtual < 0)
        throw new BadRequestException('Quantidade não pode ser negativa');
      const updated = await this.prisma.estoque.update({
        where: { id },
        data: { quantidade: dto.quantidadeAtual },
      });
      await this.auditoria.registrar(
        'ALTERAR_ESTOQUE',
        currentUser.id,
        'Estoque',
        id,
        'Atualização de quantidade',
      );
      return updated;
    }
    // ADMIN pode atualizar tudo
    if (dto.quantidadeAtual !== undefined && dto.quantidadeAtual < 0)
      throw new BadRequestException('Quantidade não pode ser negativa');
    if (dto.quantidadeMinima !== undefined && dto.quantidadeMinima < 0)
      throw new BadRequestException('Quantidade mínima não pode ser negativa');
    const updated = await this.prisma.estoque.update({
      where: { id },
      data: { ...dto },
    });
    await this.auditoria.registrar(
      'ALTERAR_ESTOQUE',
      currentUser.id,
      'Estoque',
      id,
    );
    return updated;
  }

  // Soft delete (apenas ADMIN)
  async softDelete(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode desativar estoque');
    const estoque = await this.prisma.estoque.findUnique({ where: { id } });
    if (!estoque || !estoque.ativo)
      throw new NotFoundException('Estoque não encontrado ou já inativo');
    const updated = await this.prisma.estoque.update({
      where: { id },
      data: { ativo: false },
    });
    await this.auditoria.registrar(
      'DESATIVAR_ESTOQUE',
      currentUser.id,
      'Estoque',
      id,
    );
    return updated;
  }
}
