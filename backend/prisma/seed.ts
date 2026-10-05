import { Papel, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categoriasPadrao = ['Hardware', 'Software', 'Rede', 'Acesso'];

async function main(): Promise<void> {
    for (const nome of categoriasPadrao) {
        await prisma.categoria.upsert({ where: { nome }, update: {}, create: { nome } });
    }

    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_SENHA;
    if (!email || !senha) {
        console.log('seed: ADMIN_EMAIL/ADMIN_SENHA não definidos, admin não criado');
        return;
    }

    await prisma.usuario.upsert({
        where: { email },
        update: {},
        create: {
            nome: 'Administrador',
            email,
            senhaHash: await bcrypt.hash(senha, 10),
            papel: Papel.ADMIN,
        },
    });
    console.log(`seed: admin ${email} pronto`);
}

main()
    .catch((erro) => {
        console.error(erro);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
