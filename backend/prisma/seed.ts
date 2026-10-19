import { Papel, PrismaClient } from '@prisma/client';

import {
    gerarHashSenha,
    senhaTemTamanhoValido,
    TAMANHO_MAXIMO_SENHA,
    TAMANHO_MINIMO_SENHA,
} from '../src/shared/seguranca/senha';

const prisma = new PrismaClient();

const categoriasPadrao = ['Hardware', 'Software', 'Rede', 'Acesso'];

async function popularBanco(): Promise<void> {
    for (const nome of categoriasPadrao) {
        await prisma.categoria.upsert({ where: { nome }, update: {}, create: { nome } });
    }

    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_SENHA;
    if (!email || !senha) {
        console.log('seed: ADMIN_EMAIL/ADMIN_SENHA não definidos, admin não criado');
        return;
    }
    if (!senhaTemTamanhoValido(senha)) {
        console.error(
            `seed: ADMIN_SENHA deve ter entre ${TAMANHO_MINIMO_SENHA} e ${TAMANHO_MAXIMO_SENHA} caracteres, admin não criado`,
        );
        return;
    }

    await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            nome: 'Administrador',
            email,
            senhaHash: await gerarHashSenha(senha),
            papel: Papel.ADMIN,
        },
    });
    console.log(`seed: admin ${email} pronto`);
}

popularBanco()
    .catch((erro) => {
        console.error(erro);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
