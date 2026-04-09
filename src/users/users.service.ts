import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '@src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditoria: AuditoriaService,
  ) {}

  // =============================
  // Criação de usuário com regras de vínculo e hash de senha
  // =============================
  async create(dto: CreateUserDto, currentUser: any) {
    // Para criação via admin, permitir criação sem vínculos obrigatórios por enquanto
    // TODO: Implementar seleção de unidade/região no frontend admin
    /*
    if (dto.perfil === 'FUNCIONARIO' && !dto.unidadeId) {
      throw new BadRequestException(
        'Funcionário deve estar vinculado a uma unidade',
      );
    }
    if (dto.perfil === 'GERENTE_REGIONAL' && !dto.regiaoId) {
      throw new BadRequestException(
        'Gerente Regional deve estar vinculado a uma região',
      );
    }
    if (dto.perfil === 'GERENTE_REGIONAL' && dto.unidadeId) {
      throw new BadRequestException(
        'Gerente Regional não pode estar vinculado a unidade',
      );
    }
    if (dto.perfil === 'CLIENTE' && (dto.unidadeId || dto.regiaoId)) {
      throw new BadRequestException(
        'Cliente não deve estar vinculado a unidade ou região',
      );
    }
    */

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const user = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senha: senhaHash,
        perfil: dto.perfil as any,
        unidadeId: dto.unidadeId ?? null,
        regiaoId: dto.regiaoId ?? null,
        consentimento: dto.consentimentoLGPD ?? false,
        dataConsentimento: dto.dataConsentimento
          ? new Date(dto.dataConsentimento)
          : null,
        ativo: true,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });

    await this.auditoria.registrar(
      'CRIAR_USUARIO',
      currentUser.id,
      'Usuario',
      user.id,
      `Perfil: ${user.perfil}`,
    );

    return user;
  }

  // =============================
  // Listar usuários (paginação)
  // =============================
  async findAll(page = 1, limit = 10) {
    const [users, total] = await Promise.all([
      this.prisma.usuario.findMany({
        where: { ativo: true },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          unidadeId: true,
          regiaoId: true,
          consentimento: true,
          dataConsentimento: true,
          ativo: true,
          createdAt: true,
        },
      }),
      this.prisma.usuario.count({ where: { ativo: true } }),
    ]);
    return { data: users, total, page, limit };
  }

  // =============================
  // Buscar usuário por id
  // =============================
  async findById(id: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });
    if (!user || !user.ativo)
      throw new NotFoundException('Usuário não encontrado ou inativo');
    return user;
  }

  // =============================
  // Atualizar usuário (exceto perfil/role)
  // =============================
  async update(id: string, dto: UpdateUserDto, currentUser: any) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user || !user.ativo)
      throw new NotFoundException('Usuário não encontrado ou inativo');

    if (currentUser.role !== 'ADMIN' && currentUser.id !== id)
      throw new ForbiddenException('Acesso negado');
    if ('perfil' in dto)
      throw new BadRequestException(
        'Não é permitido alterar o perfil por este endpoint',
      );

    // Atualizar senha se enviada e demais campos
    const data: any = { ...dto };
    if (dto.senha) {
      data.senha = await bcrypt.hash(dto.senha, 10);
    }
    delete data.senha; // nunca retorna a senha

    const updated = await this.prisma.usuario.update({
      where: { id },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });

    await this.auditoria.registrar(
      'ALTERAR_USUARIO',
      currentUser.id,
      'Usuario',
      updated.id,
    );

    return updated;
  }

  // =============================
  // Atualizar role/perfil (apenas ADMIN)
  // =============================
  async updateRole(id: string, dto: any, currentUser: any) {
    if (currentUser.role !== 'ADMIN')
      throw new ForbiddenException('Apenas ADMIN pode alterar perfil');
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user || !user.ativo)
      throw new NotFoundException('Usuário não encontrado ou inativo');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { perfil: dto.role },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });

    await this.auditoria.registrar(
      'ALTERAR_PERFIL_USUARIO',
      currentUser.id,
      'Usuario',
      updated.id,
      `Novo perfil: ${dto.role}`,
    );

    return updated;
  }

  // =============================
  // Atualizar consentimento LGPD
  // =============================
  async updateConsentimento(
    id: string,
    consentimento: boolean,
    currentUser: any,
  ) {
    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user || !user.ativo)
      throw new NotFoundException('Usuário não encontrado ou inativo');

    if (currentUser.role !== 'ADMIN' && currentUser.id !== id)
      throw new ForbiddenException('Acesso negado');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: {
        consentimento,
        dataConsentimento: consentimento ? new Date() : null,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });

    await this.auditoria.registrar(
      'ALTERAR_CONSENTIMENTO_USUARIO',
      currentUser.id,
      'Usuario',
      updated.id,
      `Consentimento: ${consentimento}`,
    );

    return updated;
  }

  // =============================
  // Soft delete (apenas ADMIN ou próprio usuário)
  // =============================
  async softDelete(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id)
      throw new ForbiddenException('Acesso negado');

    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user || !user.ativo)
      throw new NotFoundException('Usuário não encontrado ou já inativo');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: { ativo: false },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });

    await this.auditoria.registrar(
      'DESATIVAR_USUARIO',
      currentUser.id,
      'Usuario',
      updated.id,
    );

    return updated;
  }

  // =============================
  // Anonimizar dados do usuário (RGPD - direito ao esquecimento)
  // =============================
  async anonimizar(id: string, currentUser: any) {
    if (currentUser.role !== 'ADMIN' && currentUser.id !== id)
      throw new ForbiddenException('Acesso negado');

    const user = await this.prisma.usuario.findUnique({ where: { id } });
    if (!user || !user.ativo)
      throw new NotFoundException('Usuário não encontrado ou já inativo');

    const updated = await this.prisma.usuario.update({
      where: { id },
      data: {
        nome: 'Usuário Anonimizado',
        email: `anonimo_${id}@anonimizado.com`,
        ativo: false,
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        unidadeId: true,
        regiaoId: true,
        consentimento: true,
        dataConsentimento: true,
        ativo: true,
        createdAt: true,
      },
    });

    await this.auditoria.registrar(
      'ANONIMIZAR_USUARIO',
      currentUser.id,
      'Usuario',
      updated.id,
    );

    return updated;
  }

  // Informações simplificadas para a tela do cliente
  async me(currentUser: any) {
    if (!currentUser || !currentUser.id)
      throw new ForbiddenException('Usuário não autenticado');
    const user = await this.prisma.usuario.findUnique({
      where: { id: currentUser.id },
      select: { id: true, consentimento: true },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    const fidel = await this.prisma.fidelidade.findUnique({
      where: { usuarioId: currentUser.id },
      select: { pontos: true },
    });

    return {
      id: user.id,
      consentimento: user.consentimento,
      pontos: fidel?.pontos ?? 0,
    };
  }
}
