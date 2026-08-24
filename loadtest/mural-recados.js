// Teste de carga do Mural de Recados (k6 - https://k6.io)
//
// Uso:
//   k6 run loadtest/mural-recados.js
//   k6 run -e BASE_URL=http://localhost:8080 loadtest/mural-recados.js
//
// Para ignorar as rampas do script e usar carga constante:
//   k6 run --vus 50 --duration 2m loadtest/mural-recados.js

import http from 'k6/http';
import { check, group, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const JSON_HEADERS = { headers: { 'Content-Type': 'application/json' } };
const NOMES = ['Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fabio', 'Gabriela', 'Hugo'];

function nomeAleatorio() {
    const nome = NOMES[Math.floor(Math.random() * NOMES.length)];
    return `${nome}-${Math.floor(Math.random() * 100000)}`;
}

function inteiroEntre(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const options = {
    stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 50 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.01'],
        http_req_duration: ['p(95)<500'],
    },
};

export function setup() {
    const res = http.get(`${BASE_URL}/api/health`);
    if (res.status !== 200) {
        throw new Error(`API indisponível em ${BASE_URL} (status ${res.status})`);
    }
}

export default function () {
    group('listar recados', () => {
        const res = http.get(`${BASE_URL}/api/recados`);
        check(res, { 'listar: status 200': (r) => r.status === 200 });
    });

    group('criar, editar e excluir recado', () => {
        const criar = http.post(
            `${BASE_URL}/api/recados`,
            JSON.stringify({
                nome: nomeAleatorio(),
                mensagem: `Recado de teste de carga - ${new Date().toISOString()}`,
            }),
            JSON_HEADERS
        );
        const criado = check(criar, { 'criar: status 201': (r) => r.status === 201 });
        if (!criado) return;

        const id = criar.json('id');

        const editar = http.put(
            `${BASE_URL}/api/recados/${id}`,
            JSON.stringify({ nome: nomeAleatorio(), mensagem: 'Editado durante o teste de carga' }),
            JSON_HEADERS
        );
        check(editar, { 'editar: status 200': (r) => r.status === 200 });

        const excluir = http.del(`${BASE_URL}/api/recados/${id}`);
        check(excluir, { 'excluir: status 204': (r) => r.status === 204 });
    });

    sleep(inteiroEntre(1, 3));
}
