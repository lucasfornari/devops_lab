import express, { Express } from 'express';
import { authRouter } from './modules/auth/auth.routes';
import { usuariosRouter } from './modules/usuarios/usuarios.routes';
import { categoriasRouter } from './modules/categorias/categorias.routes';
import { chamadosRouter } from './modules/chamados/chamados.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

export function criarApp(): Express {
    const app = express();

    app.use(express.json());

    app.get('/api/health', (_req, res) => {
        res.status(200).json({ status: 'ok' });
    });

    app.use('/api/auth', authRouter);
    app.use('/api/usuarios', usuariosRouter);
    app.use('/api/categorias', categoriasRouter);
    app.use('/api/chamados', chamadosRouter);

    app.use(errorHandler);

    return app;
}
