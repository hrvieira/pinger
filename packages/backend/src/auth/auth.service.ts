import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email},
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Email ou senha incorretos.');
    };

    if (!user.isApproved) {
      throw new ForbiddenException('Cadastro enviado, esperando aprovação.');
    }

    return {
      access_token: this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role
      }),
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async register(createAuthDto: CreateAuthDto) {
    const email = createAuthDto.email.toLowerCase();

    const allowedDomains = ['@outlook.com', '@hotmail.com', '@gmail.com'];
    const isDomainValid = allowedDomains.some(domain => email.endsWith(domain));

    if (!isDomainValid) {
      throw new BadRequestException('O email deve ser de um domínio permitido: @outlook.com, @hotmail.com, @gmail.com');
    }

    const exists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (exists) {
      if (!exists.isApproved) {
        throw new BadRequestException('Este email já foi cadastrado e está aguardando aprovação.');
      }

      throw new BadRequestException('Este email já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

    await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: createAuthDto.name,
        role: 'USER',
        isApproved: false,
      },
    });

    return {
      message:
        'Cadastro enviado para análise. Aguarde a aprovação do administrador para logar.',
    };

  }

  async updatePassword(userId: number, updateAuthDto: UpdateAuthDto) {
    if (!updateAuthDto.currentPassword || !updateAuthDto.newPassword) {
      throw new BadRequestException('Senha atual e nova senha são obrigatórias.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new UnauthorizedException('Usuário não encontrado.');

    const isMatch = await bcrypt.compare(updateAuthDto.currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('A senha atual está incorreta.');
    }

    const hashedNewPassword = await bcrypt.hash(updateAuthDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword},
    });

    return { message: 'Senha atualizada com sucesso.' };
  }

}