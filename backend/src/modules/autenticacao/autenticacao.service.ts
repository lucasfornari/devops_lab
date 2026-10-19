import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Papel } from '@prisma/client';

import { PrismaService } from '../../shared/prisma/prisma.service';
import { compararSenha, gerarHashSenha } from '../../shared/seguranca/senha';
import { LoginDto } from './dto/login.dto';
import { RegistrarDto } from './dto/registrar.dto';

@Injectable()
export class AutenticacaoService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async registrar(dados: RegistrarDto) {
        const email = dados.email.trim();
        const existente = await this.prisma.usuario.findUnique({ where: { email } });
        if (existente) {
            throw new ConflictException('já existe um usuário com este email');
        }

        const usuario = await this.prisma.usuario.create({
            data: {
                nome: dados.nome.trim(),
                email,
                senhaHash: await gerarHashSenha(dados.senha),
                papel: Papel.USUARIO,
            },
        });

        return this.respostaDeAutenticacao(usuario);
    }

    async login(dados: LoginDto) {
        const usuario = await this.prisma.usuario.findUnique({
            where: { email: dados.email.trim() },
        });

        if (!usuario || !(await compararSenha(dados.senha, usuario.senhaHash))) {
            throw new UnauthorizedException('email ou senha inválidos');
        }

        return this.respostaDeAutenticacao(usuario);
    }

    private respostaDeAutenticacao(usuario: { id: number; nome: string; email: string; papel: Papel }) {
        return {
            token: this.jwtService.sign({ id: usuario.id, papel: usuario.papel }),
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                papel: usuario.papel,
            },
        };
    }
}
