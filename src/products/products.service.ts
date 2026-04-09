// Alexsander Xavier - 4338139
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@src/prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // =============================
  // Criar produto (ADMIN)
  // =============================
  async create(dto: any, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode criar produto');

    const produto = await this.prisma.produto.create({
      data: dto,
    });

    await this.auditoria.registrar(
      'CRIAR_PRODUTO',
      currentUser.id,
      'Produto',
      produto.id,
    );

    return produto;
  }

  // =============================
  // Editar produto (ADMIN)
  // =============================
  async update(id: string, dto: any, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode editar produto');

    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });

    if (!produto || !produto.ativo)
      throw new NotFoundException('Produto não encontrado ou inativo');

    const updated = await this.prisma.produto.update({
      where: { id },
      data: dto,
    });

    await this.auditoria.registrar(
      'EDITAR_PRODUTO',
      currentUser.id,
      'Produto',
      id,
    );

    return updated;
  }

  // =============================
  // Soft Delete (ADMIN)
  // =============================
  async softDelete(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode desativar produto');

    const produto = await this.prisma.produto.findUnique({
      where: { id },
    });

    if (!produto || !produto.ativo)
      throw new NotFoundException('Produto não encontrado ou já inativo');

    const updated = await this.prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });

    await this.auditoria.registrar(
      'DESATIVAR_PRODUTO',
      currentUser.id,
      'Produto',
      id,
    );

    return updated;
  }

  // =============================
  // Listagem pública paginada
  // =============================
  async findAllPublic(page = 1, limit = 10) {
    const now = new Date();

    const where = {
      ativo: true,
      disponibilidades: {
        some: { disponivel: true, unidade: { ativo: true } },
      },
      OR: [
        { produtoSazonal: false },
        {
          produtoSazonal: true,
          dataInicioDisponibilidade: { lte: now },
          dataFimDisponibilidade: { gte: now },
        },
      ],
    };

    const [produtos, total] = await Promise.all([
      this.prisma.produto.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { nome: 'asc' },
      }),
      this.prisma.produto.count({ where }),
    ]);

    return { data: produtos, total, page, limit };
  }

  // =============================
  // Alterar disponibilidade por unidade (ADMIN)
  // =============================
  async setDisponibilidadePorUnidade(
    productId: string,
    unidadeIds: string[],
    currentUser: any,
  ) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode alterar disponibilidade');

    const produto = await this.prisma.produto.findUnique({
      where: { id: productId },
    });

    if (!produto || !produto.ativo)
      throw new NotFoundException('Produto não encontrado ou inativo');

    const unidades = await this.prisma.unidade.findMany({
      where: { id: { in: unidadeIds }, ativo: true },
    });

    if (unidades.length !== unidadeIds.length)
      throw new BadRequestException(
        'Alguma unidade não existe ou está inativa',
      );

    await this.prisma.produtoDisponibilidade.deleteMany({
      where: { produtoId: productId },
    });

    await this.prisma.produtoDisponibilidade.createMany({
      data: unidadeIds.map((unidadeId) => ({
        produtoId: productId,
        unidadeId,
        disponivel: true,
      })),
    });

    await this.auditoria.registrar(
      'ALTERAR_DISPONIBILIDADE_PRODUTO',
      currentUser.id,
      'Produto',
      productId,
      `Unidades: ${unidadeIds.join(',')}`,
    );

    return { message: 'Disponibilidade atualizada' };
  }

  // =============================
  // Produtos disponíveis por unidade
  // =============================
  async getProdutosDisponiveisPorUnidade(unitId: string) {
    const unidade = await this.prisma.unidade.findUnique({
      where: { id: unitId },
    });

    if (!unidade || !unidade.ativo)
      throw new NotFoundException('Unidade não encontrada ou inativa');

    const now = new Date();

    const produtosDisponiveis =
      await this.prisma.produtoDisponibilidade.findMany({
        where: {
          unidadeId: unitId,
          disponivel: true,
          produto: { ativo: true },
        },
        include: { produto: true },
      });
    return produtosDisponiveis
      .filter((pd: any) => {
        const p = pd.produto;
        if (!p) return false;
        if (!p.ativo) return false;

        if (p.produtoSazonal) {
          if (p.dataInicioDisponibilidade && now < p.dataInicioDisponibilidade)
            return false;
          if (p.dataFimDisponibilidade && now > p.dataFimDisponibilidade)
            return false;
        }

        return true;
      })
      .map((pd: any) => pd.produto);
  }
}
