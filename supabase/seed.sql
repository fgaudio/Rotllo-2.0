-- Datos iniciales.
--   · Categorías: la lista cerrada definitiva (docs/system-design.md). Va también a producción.
--   · Locales y planes de DEMO: solo para desarrollo. Las fechas se calculan desde hoy
--     para que los filtros "Hoy" y "Este finde" siempre enseñen algo.
-- Se ejecuta solo con `supabase db reset` (en local). En producción, las categorías
-- se cargan una vez desde el editor SQL.

insert into public.categorias (slug, nombre, icono, orden) values
  ('fiesta',            '{"es": "Fiesta",            "en": "Party",            "it": "Festa"}',            'sparkles',      1),
  ('musica-en-directo', '{"es": "Música en directo", "en": "Live music",       "it": "Musica dal vivo"}',  'mic',           2),
  ('bar-y-tardeo',      '{"es": "Bar y tardeo",      "en": "Bars & afternoon", "it": "Bar e aperitivo"}',  'beer',          3),
  ('gastro',            '{"es": "Gastro",            "en": "Food & drink",     "it": "Gastronomia"}',      'restaurant',    4),
  ('cultura',           '{"es": "Cultura",           "en": "Culture",          "it": "Cultura"}',          'color-palette', 5),
  ('deporte',           '{"es": "Deporte",           "en": "Sports",           "it": "Sport"}',            'football',      6),
  ('talleres',          '{"es": "Talleres",          "en": "Workshops",        "it": "Laboratori"}',       'construct',     7),
  ('social',            '{"es": "Social",            "en": "Meet people",      "it": "Conoscere gente"}',  'people',        8),
  ('aire-libre',        '{"es": "Aire libre",        "en": "Outdoors",         "it": "All''aperto"}',      'sunny',         9)
on conflict (slug) do nothing;

-- ── DEMO ────────────────────────────────────────────────────────────────────

insert into public.locales (id, nombre, slug, tipo, direccion, barrio, ubicacion, edad_minima_defecto, estado_verificacion, verificado_en)
values
  ('a0000000-0000-4000-8000-000000000001', 'Café Mercedes Jazz', 'cafe-mercedes-jazz', 'bar',
   'Calle de Sueca 27, Valencia', 'Russafa', extensions.st_setsrid(extensions.st_makepoint(-0.3755, 39.4616), 4326)::extensions.geography, 18, 'verificado', now()),
  ('a0000000-0000-4000-8000-000000000002', 'Bar La Placeta (demo)', 'bar-la-placeta-demo', 'bar',
   'Plaça del Tossal 3, Valencia', 'el Carmen', extensions.st_setsrid(extensions.st_makepoint(-0.3798, 39.4766), 4326)::extensions.geography, 18, 'verificado', now()),
  ('a0000000-0000-4000-8000-000000000003', 'Sala Marina (demo)', 'sala-marina-demo', 'discoteca',
   'Moll de la Duana, Valencia', 'la Marina', extensions.st_setsrid(extensions.st_makepoint(-0.3268, 39.4589), 4326)::extensions.geography, 21, 'verificado', now()),
  ('a0000000-0000-4000-8000-000000000004', 'Club Vóley Malva-rosa (demo)', 'club-voley-malvarrosa-demo', 'actividad',
   'Passeig Marítim de la Malva-rosa, Valencia', 'la Malva-rosa', extensions.st_setsrid(extensions.st_makepoint(-0.3237, 39.4783), 4326)::extensions.geography, 18, 'verificado', now())
on conflict (id) do nothing;

insert into public.planes (id, local_id, categoria_id, titulo, descripcion, empieza_en, es_gratis, precio_desde_centimos, modo_entradas, url_ticketera, estado)
values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001',
   (select id from public.categorias where slug = 'musica-en-directo'), 'Noche de salsa',
   'Abrimos con una clase de iniciación para que nadie se quede mirando. Después, pista libre con DJ hasta el cierre. No hace falta pareja.',
   date_trunc('day', now()) + interval '23 hours', false, 800, 'enlace_externo', 'https://example.com/entradas/salsa', 'publicado'),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002',
   (select id from public.categorias where slug = 'bar-y-tardeo'), 'Vermut y vinilos',
   'Vermut de grifo y sesión de vinilos en la terraza. Pásate, pide algo y quédate el rato que quieras.',
   date_trunc('day', now()) + ((6 - extract(dow from now())::int + 7) % 7) * interval '1 day' + interval '13 hours',
   true, null, 'ninguna', null, 'publicado'),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000004',
   (select id from public.categorias where slug = 'deporte'), 'Vóley en la playa',
   'Partidos mixtos para todos los niveles. Se hacen equipos al llegar. Trae agua y crema.',
   date_trunc('day', now()) + ((7 - extract(dow from now())::int) % 7) * interval '1 day' + interval '11 hours',
   true, null, 'ninguna', null, 'publicado'),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003',
   (select id from public.categorias where slug = 'fiesta'), 'Techno en la Marina',
   'Sesión larga junto al mar con tres DJ residentes. Abre a medianoche.',
   date_trunc('day', now()) + ((5 - extract(dow from now())::int + 7) % 7) * interval '1 day' + interval '23 hours',
   false, 1500, 'enlace_externo', 'https://example.com/entradas/techno', 'publicado')
on conflict (id) do nothing;
