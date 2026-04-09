// Alexsander Xavier - 4338139
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { RegisterDto } from './dto/register.dto';
import { sanitizeString } from './sanitizer.util';
import { PrismaService } from '@src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'GERENTE_REGIONAL' | 'CLIENTE';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const nome = sanitizeString(dto.nome);
    const email = sanitizeString(dto.email);
    const senhaHash = await bcrypt.hash(dto.senha, 10);

    // Verificar se o email já existe
    const emailExists = await this.prisma.usuario.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new ConflictException(
        'Email já cadastrado. Use outro email para se registrar.',
      );
    }

    // Se for FUNCIONARIO e tiver unidadeId, validar que unidade existe
    if (dto.perfil === 'FUNCIONARIO' && dto.unidadeId) {
      const unidadeExists = await this.prisma.unidade.findUnique({
        where: { id: dto.unidadeId },
      });
      if (!unidadeExists) {
        throw new BadRequestException('Unidade não encontrada');
      }
    }

    // Se for GERENTE_REGIONAL e tiver regiaoId, validar que região existe
    if (dto.perfil === 'GERENTE_REGIONAL' && dto.regiaoId) {
      const regiaoExists = await this.prisma.regiao.findUnique({
        where: { id: dto.regiaoId },
      });
      if (!regiaoExists) {
        throw new BadRequestException('Região não encontrada');
      }
    }

    try {
      const user = await this.prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash,
          perfil: dto.perfil as UserRole,
          unidadeId: dto.unidadeId || null,
          regiaoId: dto.regiaoId || null,
          consentimento: dto.consentimento ?? false,
        },
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          unidadeId: true,
          regiaoId: true,
          consentimento: true,
          createdAt: true,
        },
      });

      return user;
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new ConflictException(
          'Email já cadastrado. Use outro email para se registrar.',
        );
      }
      throw err;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.usuario.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.senha) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // se for administrador, exige código que esteja armazenado no registro
    if (user.perfil === 'ADMIN') {
      const userAny: any = user; // codigo may not exist in generated type
      if (!loginDto.codigo || loginDto.codigo !== userAny.codigo) {
        throw new UnauthorizedException('Código administrativo inválido');
      }
    }

    const senhaValida = await bcrypt.compare(loginDto.senha, user.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayloadDto = {
      id: user.id,
      role: user.perfil as UserRole,
      regiaoId: user.regiaoId || undefined,
      unidadeId: user.unidadeId || undefined,
    };

    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.nome,
        email: user.email,
        role: user.perfil,
        unitId: user.unidadeId || undefined,
      },
    };
  }
}
