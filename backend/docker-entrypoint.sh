#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

npx prisma migrate deploy

if [ -f dist/prisma/seed.js ]; then
    node dist/prisma/seed.js || echo "aviso: seed falhou"
else
    npx ts-node prisma/seed.ts || echo "aviso: seed falhou"
fi

exec "$@"
