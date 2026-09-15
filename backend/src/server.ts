import { criarApp } from './app';
import { env } from './config/env';

const app = criarApp();

app.listen(env.port, () => {
    console.log(`backend api listening on port ${env.port}`);
});
