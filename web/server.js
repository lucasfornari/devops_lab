const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
    host: process.env.PGHOST || 'postgres',
    port: process.env.PGPORT || 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'projeto',
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/api/recados', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nome, mensagem, criado_em FROM recados ORDER BY criado_em DESC'
        );
        res.status(200).json(result.rows);
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

app.post('/api/recados', async (req, res) => {
    const { nome, mensagem } = req.body || {};
    if (!nome || !mensagem) {
        return res.status(400).json({ status: 'error', message: 'nome e mensagem são obrigatórios' });
    }
    try {
        const result = await pool.query(
            'INSERT INTO recados (nome, mensagem) VALUES ($1, $2) RETURNING id, nome, mensagem, criado_em',
            [nome, mensagem]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

app.put('/api/recados/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, mensagem } = req.body || {};
    if (!nome || !mensagem) {
        return res.status(400).json({ status: 'error', message: 'nome e mensagem são obrigatórios' });
    }
    try {
        const result = await pool.query(
            'UPDATE recados SET nome = $1, mensagem = $2 WHERE id = $3 RETURNING id, nome, mensagem, criado_em',
            [nome, mensagem, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: 'recado não encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

app.delete('/api/recados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM recados WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ status: 'error', message: 'recado não encontrado' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(503).json({ status: 'error', message: err.message });
    }
});

async function initDb() {
    const maxRetries = 10;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS recados (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(80) NOT NULL,
                    mensagem VARCHAR(500) NOT NULL,
                    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
                )
            `);
            return;
        } catch (err) {
            console.log(`postgres indisponível (tentativa ${attempt}/${maxRetries}): ${err.message}`);
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }
    throw new Error('não foi possível conectar ao postgres após várias tentativas');
}

initDb()
    .then(() => {
        app.listen(port, () => {
            console.log(`web api listening on port ${port}`);
        });
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
