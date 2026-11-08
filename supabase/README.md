# Supabase

Aquí vivirá todo lo del backend (ADR-002):

- `migrations/`: archivos SQL numerados que crean y cambian las tablas. Cada cambio de la base de datos es un archivo nuevo y queda en git.
- `functions/`: Edge Functions (por ejemplo, `crear-compra` o `stripe-webhook` en la v2).
- `seed.sql`: datos de prueba (categorías, planes de ejemplo).

## Siguiente paso

1. Crear el proyecto en supabase.com (región UE) y poner la URL y la anon key en `.env` (ver `.env.example`).
2. Instalar la CLI de Supabase y ejecutar `supabase init` y `supabase link`.
3. Primera migración con las tablas de la v1 de `docs/system-design.md`: perfiles, admins_rotllo, locales, locales_privado, miembros_local, categorias, planes, fotos_plan, favoritos, reportes y clics_ticketera, con sus reglas RLS.
