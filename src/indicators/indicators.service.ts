// Alexsander Xavier - 4338139
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';

@Injectable()
export class IndicatorsService {
  constructor(private readonly prisma: PrismaService) {}

  // Produto mais vendido (quantidade) na região
  async getProdutoMaisVendido(
    regionId: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    let dataInicioDate: Date | undefined;
    let dataFimDate: Date | undefined;

    if (dataInicio) {
      dataInicioDate = new Date(dataInicio);
      if (isNaN(dataInicioDate.getTime()))
        throw new Error('dataInicio inválida');
    }

    if (dataFim) {
      dataFimDate = new Date(dataFim);
      if (isNaN(dataFimDate.getTime())) throw new Error('dataFim inválida');
    }

    const wherePedido: any = {
      unidade: { regiaoId: regionId },
      status: { in: ['PAGO', 'FINALIZADO'] },
      ativo: true,
    };

    if (dataInicioDate || dataFimDate) {
      wherePedido.createdAt = {};
      if (dataInicioDate) wherePedido.createdAt.gte = dataInicioDate;
      if (dataFimDate) wherePedido.createdAt.lte = dataFimDate;
    }

    const pedidos = await this.prisma.pedido.findMany({
      where: wherePedido,
      select: { id: true },
    });

    if (pedidos.length === 0) return null;

    const pedidoIds = pedidos.map((p: { id: string }) => p.id);

    const group = await this.prisma.itemPedido.groupBy({
      by: ['produtoId'],
      where: { pedidoId: { in: pedidoIds } },
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: 1,
    });

    if (group.length === 0) return null;

    const produto = await this.prisma.produto.findUnique({
      where: { id: group[0].produtoId },
      select: { id: true, nome: true },
    });

    return {
      produtoId: produto?.id,
      nome: produto?.nome,
      quantidade: group[0]._sum.quantidade ?? 0,
    };
  }

  // Vendas por unidade na região
  async getVendasPorUnidade(
    regionId: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    let dataInicioDate: Date | undefined;
    let dataFimDate: Date | undefined;

    if (dataInicio) {
      dataInicioDate = new Date(dataInicio);
      if (isNaN(dataInicioDate.getTime()))
        throw new Error('dataInicio inválida');
    }

    if (dataFim) {
      dataFimDate = new Date(dataFim);
      if (isNaN(dataFimDate.getTime())) throw new Error('dataFim inválida');
    }

    const where: any = {
      unidade: { regiaoId: regionId },
      status: { in: ['PAGO', 'FINALIZADO'] },
      ativo: true,
    };

    if (dataInicioDate || dataFimDate) {
      where.createdAt = {};
      if (dataInicioDate) where.createdAt.gte = dataInicioDate;
      if (dataFimDate) where.createdAt.lte = dataFimDate;
    }

    const group = await this.prisma.pedido.groupBy({
      by: ['unidadeId'],
      where,
      _sum: { valorTotal: true },
      _count: { _all: true },
    });

    const unidadeIds = group.map((g: { unidadeId: string }) => g.unidadeId);

    const unidades = await this.prisma.unidade.findMany({
      where: { id: { in: unidadeIds } },
      select: { id: true, nome: true },
    });

    return group.map((g: any) => ({
      unidadeId: g.unidadeId,
      nome:
        unidades.find((u: { id: string; nome: string }) => u.id === g.unidadeId)
          ?.nome ?? null,
      totalVendas: g._sum.valorTotal ?? 0,
      totalPedidos: g._count._all ?? 0,
    }));
  }

  // Resumo geral da região
  async getResumoRegiao(
    regionId: string,
    dataInicio?: string,
    dataFim?: string,
  ) {
    let dataInicioDate: Date | undefined;
    let dataFimDate: Date | undefined;

    if (dataInicio) {
      dataInicioDate = new Date(dataInicio);
      if (isNaN(dataInicioDate.getTime()))
        throw new Error('dataInicio inválida');
    }

    if (dataFim) {
      dataFimDate = new Date(dataFim);
      if (isNaN(dataFimDate.getTime())) throw new Error('dataFim inválida');
    }

    const whereBase: any = {
      unidade: { regiaoId: regionId },
      ativo: true,
    };

    if (dataInicioDate || dataFimDate) {
      whereBase.createdAt = {};
      if (dataInicioDate) whereBase.createdAt.gte = dataInicioDate;
      if (dataFimDate) whereBase.createdAt.lte = dataFimDate;
    }

    const pedidos = await this.prisma.pedido.findMany({
      where: {
        ...whereBase,
        status: { in: ['PAGO', 'FINALIZADO', 'CANCELADO'] },
      },
      select: {
        id: true,
        valorTotal: true,
        status: true,
      },
    });

    const pagosOuFinalizados = pedidos.filter(
      (p: { status: string }) =>
        p.status === 'PAGO' || p.status === 'FINALIZADO',
    );

    const totalPedidosPagos = pagosOuFinalizados.length;

    const totalVendas = pagosOuFinalizados.reduce(
      (acc: number, p: { valorTotal: number }) => acc + p.valorTotal,
      0,
    );

    const ticketMedio =
      totalPedidosPagos > 0 ? totalVendas / totalPedidosPagos : 0;

    const totalPedidosCancelados = pedidos.filter(
      (p: { status: string }) => p.status === 'CANCELADO',
    ).length;

    return {
      totalPedidosPagos,
      totalPedidosCancelados,
      totalVendas,
      ticketMedio,
    };
  }
}
