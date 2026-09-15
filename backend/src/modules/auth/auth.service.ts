import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Papel } from '@prisma/client';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { AppError } from '../../shared/errors/AppError';
import { LoginInput, RegistrarInput } from './auth.schemas';

const SALT_ROUNDS = 10;
const EXPIRACAO_TOKEN = '8h';

function assinarToken(usuario: { id: number; papel: Papel }): string {
    return jwt.sign({ id: usuario.id, papel: usuario.papel }, env.jwtSecret, {
        expiresIn: EXPIRACAO_TOKEN,
    });
}

export async function registrar(dados: RegistrarInput) {
    const existente = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (existente) {
        throw new AppError('já existe um usuário com este email', 409);
    }

    const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);
    const usuario = await prisma.usuario.create({
        data: {
            nome: dados.nome,
            email: dados.email,
            senhaHash,
            papel: Papel.USUARIO,
        },
    });

    const token = assinarToken(usuario);
    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel } };
}

export async function login(dados: LoginInput) {
    const usuario = await prisma.usuario.findUnique({ where: { email: dados.email } });
    if (!usuario) {
        throw new AppError('email ou senha inválidos', 401);
    }

    const senhaValida = await bcrypt.compare(dados.senha, usuario.senhaHash);
    if (!senhaValida) {
        throw new AppError('email ou senha inválidos', 401);
    }

    const token = assinarToken(usuario);
    return { token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, papel: usuario.papel } };
}
