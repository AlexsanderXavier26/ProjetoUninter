import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prismaMock: Partial<PrismaClient>;

  beforeEach(async () => {
    // create simple mocks for dependencies
    prismaMock = {
      usuario: {
        findUnique: jest.fn(),
      } as any,
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaClient, useValue: prismaMock },
        { provide: JwtService, useValue: { sign: jest.fn(() => 'token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects admin login when code is missing or wrong', async () => {
    // prepare user record with ADMIN profile
    (prismaMock.usuario.findUnique as jest.Mock).mockResolvedValue({
      email: 'admin@ex',
      senha: 'hash',
      perfil: 'ADMIN',
      codigo: 'secret',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    await expect(
      service.login({ email: 'admin@ex', senha: 'whatever' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    await expect(
      service.login({
        email: 'admin@ex',
        senha: 'whatever',
        codigo: 'wrong',
      } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows admin login when code matches', async () => {
    (prismaMock.usuario.findUnique as jest.Mock).mockResolvedValue({
      email: 'admin@ex',
      senha: 'hash',
      perfil: 'ADMIN',
      codigo: 'secret',
      id: '1',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const result = await service.login({
      email: 'admin@ex',
      senha: 'whatever',
      codigo: 'secret',
    } as any);
    expect(result).toEqual({
      access_token: 'token',
      perfil: 'ADMIN',
      regiaoId: undefined,
      unidadeId: undefined,
    });
  });
});
