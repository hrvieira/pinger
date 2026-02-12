import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import {
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock global do módulo bcrypt
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'test-token'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('login', () => {
    it('deve retornar um token se as credenciais forem válidas e usuário aprovado', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const mockUser = {
        id: 1,
        email: 'test@gmail.com',
        name: 'Test',
        password: 'hashedpassword',
        role: 'USER',
        isApproved: true,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      const result = await service.login({
        email: 'test@gmail.com',
        password: '123',
      });

      expect(result).toHaveProperty('access_token', 'test-token');
    });

    it('deve lançar ForbiddenException se o usuário não for aprovado', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const mockUser = {
        id: 1,
        email: 'test@gmail.com',
        password: 'hashedpassword',
        isApproved: false,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      await expect(
        service.login({ email: 'test@gmail.com', password: '123' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar UnauthorizedException se a senha estiver errada', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const mockUser = {
        id: 1,
        email: 'test@gmail.com',
        password: 'hashedpassword',
        isApproved: true,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);

      await expect(
        service.login({ email: 'test@gmail.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('deve criar um usuário pendente se o domínio for válido', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_mock');

      const createDto = {
        email: 'novo@gmail.com',
        password: '123',
        name: 'New User',
      };

      const result = await service.register(createDto);

      expect(result).toEqual({
        message:
          'Cadastro enviado para análise. Aguarde a aprovação do administrador para logar.',
      });

      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('deve bloquear emails de domínios inválidos', async () => {
      const createDto = {
        email: 'hacker@virus.com',
        password: '123',
        name: 'Hacker',
      };

      await expect(service.register(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
