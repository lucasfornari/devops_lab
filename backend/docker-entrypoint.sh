#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
fi

npx prisma migrate deploy

exec "$@"
