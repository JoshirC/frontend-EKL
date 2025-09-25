// src/utils/ordenarProductos.ts

export type Producto = {
  familia: string;
  codigo_producto: string;
  descripcion_producto: string;
  unidad: string;
  centros: { centro: string; cantidad: number }[];
  total: number;
};

const cat_1 = [
  "ABARROTES",
  "CONFITERIA",
  "BEBESTIBLES",
  "DESECHABLES",
  "EPP",
  "FRUTAS Y VERDURAS",
  "MATERIALES ASEO Y EPP",
  "OTROS NON FOOD",
  "QUÍMICOS",
];

const cat_2 = [
  "AVES",
  "CECINAS",
  "CERDO",
  "LÁCTEOS Y HUEVOS",
  "PANADERIA",
  "PANADERÍA Y PASTELERÍA",
  "PESCADOS Y MARISCOS",
  "CECINAS Y EMBUTIDOS",
  "CERDOS",
  "VACUNO",
  "HUEVOS Y LACTEOS",
  "X",
];

/**
 * Devuelve un número de prioridad para ordenar familias:
 * - cat_1: según el índice en la lista
 * - cat_2: después de cat_1, según el índice en la lista
 * - resto: después de cat_1 y cat_2, ordenados alfabéticamente
 */
function getFamiliaPriority(familia: string): { group: number; index: number } {
  const i1 = cat_1.indexOf(familia);
  if (i1 !== -1) return { group: 1, index: i1 };

  const i2 = cat_2.indexOf(familia);
  if (i2 !== -1) return { group: 2, index: i2 };

  return { group: 3, index: 0 }; // resto, se ordenan por nombre
}

export function ordenarProductos(productos: Producto[]): Producto[] {
  return [...productos].sort((a, b) => {
    const pa = getFamiliaPriority(a.familia);
    const pb = getFamiliaPriority(b.familia);

    // Primero ordenar por grupo (cat_1 → cat_2 → resto)
    if (pa.group !== pb.group) return pa.group - pb.group;

    // Dentro de cat_1 o cat_2 → orden según índice predefinido
    if (pa.group === 1 || pa.group === 2) {
      if (pa.index !== pb.index) return pa.index - pb.index;
    }

    // Si están en el grupo "resto", ordenar por familia alfabéticamente
    if (pa.group === 3 && pb.group === 3 && a.familia !== b.familia) {
      return a.familia.localeCompare(b.familia);
    }

    // Finalmente, ordenar dentro de la misma familia por descripción
    return a.descripcion_producto.localeCompare(b.descripcion_producto);
  });
}
