// Alexsander Xavier - 4338139

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import { StockService } from '../stock/stock.service';
import { PaymentService } from '../payment/payment.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AddOrderItemDto } from './dto/add-order-item.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
    private readonly stockService: StockService,
    private readonly paymentService: PaymentService,
  ) {}

  async criarPedido(dto: CreateOrderDto, currentUser: any) {
    let cliente = null;
    if (dto.clienteId) {
      cliente = await this.prisma.usuario.findUnique({
        where: { id: dto.clienteId },
      });

      if (!cliente || !cliente.ativo)
        throw new NotFoundException('Cliente não encontrado ou inativo');
    }

    let unidade = null;
    if (dto.unidadeId) {
      unidade = await this.prisma.unidade.findUnique({
        where: { id: dto.unidadeId },
      });

      if (!unidade || !unidade.ativo)
        throw new NotFoundException('Unidade não encontrada ou inativa');
    }

    let valorTotal = 0;

    const pedido = await this.prisma.$transaction(
      async (tx) => {
        // Validar e buscar informações dos produtos primeiro (fora da transação seria ideal, mas fazemos rápido)
        const itensDetalhes: Array<{
          produtoId: string;
          quantidade: number;
          preco: number;
          nome: string;
        }> = [];

        for (const item of dto.itens) {
          const produto = await tx.produto.findUnique({
            where: { id: item.produtoId },
          });
          if (!produto) throw new NotFoundException('Produto não encontrado');

          valorTotal += produto.preco * item.quantidade;
          itensDetalhes.push({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
            preco: item.precoUnitario ?? produto.preco,
            nome: produto.nome,
          });
        }

        // Buscar unidade se fornecido
        let unidadeRegiao = '';
        if (dto.unidadeId) {
          const unidadeCheck = await tx.unidade.findUnique({
            where: { id: dto.unidadeId },
          });
          if (!unidadeCheck || !unidadeCheck.ativo)
            throw new NotFoundException('Unidade não encontrada ou inativa');
          unidadeRegiao = unidadeCheck.regiaoId;
        }

        // Criar pedido
        const createPedidoData: any = {
          unidadeId: dto.unidadeId,
          status: 'CRIADO',
          valorTotal,
          ativo: true,
        };
        if (dto.clienteId) {
          createPedidoData.usuarioId = dto.clienteId;
        }

        const novoPedido = await tx.pedido.create({ data: createPedidoData });

        // Criar itens
        for (const it of itensDetalhes) {
          await tx.itemPedido.create({
            data: {
              pedidoId: novoPedido.id,
              produtoId: it.produtoId,
              quantidade: it.quantidade,
              preco: it.preco,
              nome: it.nome,
              regiaoId: unidadeRegiao,
            },
          });
        }

        // Criar histórico
        await tx.historicoPedido.create({
          data: { pedidoId: novoPedido.id, status: 'CRIADO' },
        });

        return tx.pedido.findUnique({
          where: { id: novoPedido.id },
          include: { itens: true },
        });
      },
      { timeout: 15000 }, // Aumentar timeout para 15 segundos
    );

    // Registrar auditoria fora da transação (pode ser mais lento)
    if (currentUser?.id && pedido?.id) {
      this.auditoria
        .registrar('CRIAR_PEDIDO', currentUser.id, 'Pedido', pedido.id)
        .catch((err) => {
          // Log silencioso se auditoria falhar
          console.warn('Auditoria falhou:', err.message);
        });
    }

    return pedido;
  }

  async adicionarItem(
    pedidoId: string,
    item: AddOrderItemDto,
    currentUser: any,
  ) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    });

    if (!pedido || !pedido.ativo)
      throw new NotFoundException('Pedido não encontrado');

    if (pedido.status !== 'CRIADO')
      throw new BadRequestException(
        'Só é possível adicionar itens em pedidos CRIADO',
      );

    const produto = await this.prisma.produto.findUnique({
      where: { id: item.produtoId },
    });

    if (!produto) throw new NotFoundException('Produto não encontrado');

    await this.stockService.reservarEstoque(
      item.produtoId,
      pedido.unidadeId,
      item.quantidade,
    );

    const unidadeObj = await this.prisma.unidade.findUnique({
      where: { id: pedido.unidadeId },
    });
    const novoItem = await this.prisma.itemPedido.create({
      data: {
        pedidoId,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        preco: produto.preco,
        nome: produto.nome,
        regiaoId: unidadeObj?.regiaoId ?? '',
      },
    });

    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        valorTotal: pedido.valorTotal + produto.preco * item.quantidade,
      },
    });

    await this.auditoria.registrar(
      'ADICIONAR_ITEM_PEDIDO',
      currentUser.id,
      'Pedido',
      pedidoId,
    );

    return novoItem;
  }

  async cancelarPedido(pedidoId: string, currentUser: any) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { itens: true },
    });

    if (!pedido || !pedido.ativo)
      throw new NotFoundException('Pedido não encontrado');

    if (pedido.status === 'CANCELADO' || pedido.status === 'FINALIZADO')
      throw new BadRequestException('Pedido já finalizado ou cancelado');

    for (const item of pedido.itens) {
      await this.stockService.cancelarReserva(
        item.produtoId,
        pedido.unidadeId,
        item.quantidade,
      );
    }

    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: { status: 'CANCELADO' },
    });

    await this.prisma.historicoPedido.create({
      data: { pedidoId, status: 'CANCELADO' },
    });

    await this.auditoria.registrar(
      'CANCELAR_PEDIDO',
      currentUser.id,
      'Pedido',
      pedidoId,
    );

    return { status: 'CANCELADO' };
  }

  // novo método para listar pedidos (usado por dashboard e gestores)
  async findAll() {
    return this.prisma.pedido.findMany({ include: { itens: true } });
  }

  async getStatus(id: string) {
    const pedido = await this.prisma.pedido.findUnique({ where: { id } });
    if (!pedido) throw new NotFoundException('Pedido não encontrado');
    return pedido.status;
  }

  async softDelete(pedidoId: string, currentUser: any) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido || !pedido.ativo)
      throw new NotFoundException('Pedido não encontrado');

    if (currentUser.role !== 'ADMIN' && pedido.usuarioId !== currentUser.id)
      throw new ForbiddenException('Acesso negado');

    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: { ativo: false },
    });

    await this.auditoria.registrar(
      'SOFT_DELETE_PEDIDO',
      currentUser.id,
      'Pedido',
      pedidoId,
    );

    return { status: 'INATIVO' };
  }
}
