// Forma de un plan en la app. Es un resumen de la tabla `planes` de docs/system-design.md.

export type ModoEntradas = 'ninguna' | 'enlace_externo' | 'rotllo';

export type Plan = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string; // slug de la lista cerrada: fiesta, musica-en-directo, gastro...
  empiezaEn: string; // fecha y hora en formato ISO
  local: string;
  direccion: string;
  barrio: string;
  lat: number;
  lng: number;
  esGratis: boolean;
  precioDesdeCentimos: number | null;
  edadMinima: number; // 18 como mínimo
  modoEntradas: ModoEntradas;
  urlTicketera: string | null;
  fotoUrl: string | null;
};
