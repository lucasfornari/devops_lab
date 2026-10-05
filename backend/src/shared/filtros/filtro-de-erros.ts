import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class FiltroDeErros implements ExceptionFilter {
    catch(erro: unknown, host: ArgumentsHost): void {
        const response = host.switchToHttp().getResponse();
        const resultado = this.converterErro(erro);

        response.status(resultado.status).json({
            status: 'error',
            message: resultado.message,
        });
    }

    private converterErro(erro: unknown): { status: number; message: string } {
        if (erro instanceof HttpException) {
            const status = erro.getStatus();
            const resposta = erro.getResponse();
            const message =
                typeof resposta === 'object' && resposta !== null && 'message' in resposta
                    ? (resposta as { message: string | string[] }).message
                    : resposta;

            return {
                status,
                message: Array.isArray(message) ? message.join(', ') : String(message),
            };
        }

        if (erro instanceof Prisma.PrismaClientKnownRequestError) {
            if (erro.code === 'P2025') {
                return { status: HttpStatus.NOT_FOUND, message: 'registro não encontrado' };
            }
            if (erro.code === 'P2002') {
                return { status: HttpStatus.CONFLICT, message: 'registro já existe' };
            }
        }

        console.error(erro);
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'erro interno do servidor',
        };
    }
}
