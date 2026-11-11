// Carga los planes guardados (los ids viven en el móvil; los datos, en la base de datos).
import { useEffect, useState } from 'react';

import { useGuardados } from './guardados';
import { obtenerPlan } from './planes';
import type { Plan } from './tipos';

export function usePlanesGuardados() {
  const ids = useGuardados();
  const clave = ids.join(',');
  const [respuesta, setRespuesta] = useState<{ clave: string; planes: Plan[] } | null>(null);

  useEffect(() => {
    let vigente = true;
    // Si un plan ya no existe o falla al cargar, simplemente no sale.
    Promise.all(ids.map((id) => obtenerPlan(id).catch(() => null))).then(
      (planes) => vigente && setRespuesta({ clave, planes: planes.filter((plan): plan is Plan => plan !== null) }),
    );
    return () => {
      vigente = false;
    };
  }, [ids, clave]);

  // Mientras llega la lista nueva se enseña la anterior, sin los que se acaban de quitar.
  const planes = (respuesta?.planes ?? []).filter((plan) => ids.includes(plan.id));
  return { planes, cargando: respuesta === null && ids.length > 0, hayGuardados: ids.length > 0 };
}
