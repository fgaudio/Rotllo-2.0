#!/usr/bin/env bash
# Prueba la base de datos en un Postgres local que imita a Supabase.
#
# Crea una base de datos vacía, aplica las migraciones y el seed, y ejecuta los tests
# de supabase/tests/database con pgTAP. Necesita Postgres 16 + PostGIS + pgTAP.
#
# Uso (como usuario postgres):  bash scripts/db/probar.sh
# Con la CLI de Supabase y Docker, lo equivalente es:  supabase db reset && supabase test db
set -euo pipefail

RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
DB="${DB:-rotllo_pruebas}"
PSQL=(psql -X -q -v ON_ERROR_STOP=1)

"${PSQL[@]}" -d postgres -c "drop database if exists $DB" -c "create database $DB"
# Como en Supabase: las funciones de PostGIS y pgTAP están en el esquema "extensions".
"${PSQL[@]}" -d postgres -c "alter database $DB set search_path to \"\$user\", public, extensions"
"${PSQL[@]}" -d "$DB" -f "$RAIZ/scripts/db/simular-supabase.sql"
for migracion in "$RAIZ"/supabase/migrations/*.sql; do
  echo "→ $(basename "$migracion")"
  "${PSQL[@]}" -d "$DB" -f "$migracion"
done
echo "→ seed.sql"
"${PSQL[@]}" -d "$DB" -f "$RAIZ/supabase/seed.sql"
"${PSQL[@]}" -d "$DB" -c "create extension if not exists pgtap with schema extensions"
pg_prove -d "$DB" "$RAIZ"/supabase/tests/database/*.test.sql
