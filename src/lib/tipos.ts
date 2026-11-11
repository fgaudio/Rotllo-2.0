// Forma de un plan en la app. Es un resumen de la tabla `planes` de docs/system-design.md.

export type ModoEntradas = 'ninguna' | 'enlace_externo' | 'rotllo';

// Cómo quiere el local su cartel cuando no sube una foto o un flyer propio.
// Todo es opcional: lo que falte se decide solo (ver src/lib/cartel.ts).
export type EstiloCartel = 'cinta' | 'inicial' | 'serie';
export type ConfigCartel = {
  estilo?: EstiloCartel;
  color?: string; // un nombre de coloresCartel (src/theme/tokens.ts)
  texto?: string; // lo que se lee en el cartel; si no hay, el título del plan
};

export type Plan = {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string; // slug de la lista cerrada: fiesta, musica-en-directo, gastro...
  empiezaEn: string; // fecha y hora en formato ISO
  terminaEn: string | null; // sin hora de fin, se da por terminado 6 h después de empezar
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
  fotoUrl: string | null; // foto o flyer del local: si existe, es el cartel
  cartel?: ConfigCartel | null;
};
