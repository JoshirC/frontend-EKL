export interface LoginUserInput {
  rut: string;
  contrasena: string;
}

export interface LoginResponse {
  login: {
    access_token: string;
    user: User;
  };
}

export type Producto = {
  id: number;
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  precio_unitario?: number;
  cantidad: number;
  cantidad_softland: number;
  cantidad_emergencia?: number;
  cantidad_oc?: number;
  cantidad_a_enviar?: number;
  trazabilidad: boolean;
  detallesOrden: DetalleOrdenAcopio[]; // renombrado según entity
  enviosDetalle?: EnvioDetalleOrdenAcopio[]; // renombrado según entity
  guiaEntradaDetalle: GuiaEntradaDetalle[]; // renombrado según entity y no opcional
  trazabilidad_entidad: Trazabilidad[]; // no opcional
  detallesSolicitud?: DetalleSolicitudSMCL[]; // opcional
};

export interface OrdenAcopio {
  id: number;
  centro_costo: string;
  fecha_despacho: string;
  estado: string;
  detalles: DetalleOrdenAcopio[];
  consolidado?: Consolidado | null;
  detallesSolicitudSMCL?: DetalleSolicitudSMCL[] | null;
  pallets?: Pallet[] | null;
  guiasSalida?: GuiaSalida[] | null;
}

export type Trazabilidad = {
  id: number;
  numero_lote: string;
  cantidad_producto: number;
  fecha_elaboracion: string;
  fecha_vencimiento: string;
  temperatura?: string;
  observaciones: string;
  fecha_registro: string;
  codigo_proveedor: string;
  numero_factura: number;
  id_guia_entrada: number;
  usuario: User;
  producto: Producto;
  enviosDetalleOrdenCompra?: EnvioDetalleOrdenAcopio[];
};

export type User = {
  id: number;
  rut: string;
  nombre: string;
  correo?: string;
  contrasena: string;
  rol: string;
  eliminado: boolean;
  envios: EnvioDetalleOrdenAcopio[];
  trazabilidad: Trazabilidad[];
};

export type Pallet = {
  id: number;
  numero_pallet: number;
  id_orden_acopio: number;
  estado?: string;
  ordenAcopio: OrdenAcopio;
  envios?: EnvioDetalleOrdenAcopio[];
  guiasSalida?: GuiaSalida[];
};

export type GuiaSalida = {
  id: number;
  codigo_bodega?: string;
  numero_folio?: number;
  fecha_generacion?: string;
  concepto_salida?: string;
  descripcion?: string;
  codigo_centro_costo?: string;
  orden: OrdenAcopio;
  pallet?: Pallet;
  envios?: EnvioDetalleOrdenAcopio[];
};

export type GuiaEntrada = {
  id: number;
  codigo_bodega: string;
  numero_folio: number;
  fecha_generacion: string;
  codigo_proveedor: string;
  observacion: string;
  numero_factura: number;
  fecha_factura: string;
  numero_orden_compra: number;
  estado: string;
  guiaEntradaDetalle: GuiaEntradaDetalle[];
};

export type GuiaEntradaDetalle = {
  id: number;
  producto: Producto;
  cantidad_ingresada: number;
  precio_unitario: number;
  id_guia_entrada: number;
  guiaEntrada: GuiaEntrada;
};

export type EnvioDetalleOrdenAcopio = {
  id: number;
  detalleOrdenAcopio: DetalleOrdenAcopio;
  usuario: User;
  codigo_producto_enviado: string;
  producto: Producto;
  cantidad_enviada: number;
  pallet?: Pallet;
  trazabilidad?: Trazabilidad | null;
  guiaSalida?: GuiaSalida;
};

export type DetalleSolicitudSMCL = {
  id: number;
  id_orden_acopio: number;
  familia_planilla: string;
  codigo_producto: string;
  cantidad_solicitada: number;
  periodo_solicitado: string;
  ordenAcopio: OrdenAcopio;
  producto: Producto;
};

export type DetalleOrdenAcopio = {
  id: number;
  id_orden_acopio: number;
  familia_planilla: string;
  codigo_producto: string;
  cantidad: number;
  ordenAcopio: OrdenAcopio;
  envios?: EnvioDetalleOrdenAcopio[] | null;
  producto: Producto;
};

export type Consolidado = {
  id: number;
  fecha_inicio: string;
  fecha_termino: string;
  estado: string;
  ordenesAcopio?: OrdenAcopio[];
};

export type ConsolidadoPorIdResponseSSSR = {
  estado: string;
  fecha_inicio: string;
  fecha_termino: string;
  productos: {
    id_detalle: number;
    estado_compra: boolean;
    familia: string;
    codigo_producto: string;
    descripcion_producto: string;
    unidad: string;
    stock_actual: number;
    stock_emergencia: number;
    stock_oc: number;
    compra_recomendada: number;
    centros: {
      centro: string;
      cantidad: number;
    }[];
    total: number;
  }[];
  centrosUnicos: string[];
};
export type ConsolidadoCLPorIdResponse = {
  id: number;
  estado: string;
  fecha_inicio: string;
  fecha_termino: string;
  centros: {
    centro: string;
    productos: {
      familia: string;
      codigo_producto: string;
      descripcion_producto: string;
      unidad: string;
      Lu: number;
      Ma: number;
      Mi: number;
      Ju: number;
      Vi: number;
      Sa: number;
      total: number;
    }[];
  }[];
};
export type ConsolidadoSolicitudSemanasPorIdResponse = {
  id: number;
  estado: string;
  fecha_inicio: string;
  fecha_termino: string;
  centros: {
    centro: string;
    productos: {
      familia: string;
      codigo_producto: string;
      descripcion_producto: string;
      unidad: string;
      Semana1: number;
      Semana2: number;
      Semana3: number;
      Semana4: number;
      Semana5: number;
      total: number;
    }[];
  }[];
};
export type OCDetalleDto = {
  CodProd: string;
  DetProd: string;
  Cantidad: number;
  PrecioUnit: number;
};
export type ListadoOCDto = {
  NumInterOC: number;
  NumOC: string;
  FecFinalOC: string;
  NomCon: string;
  CodAux: string;
  NomAux: string;
};
export type ProductoConsolidado = {
  id_detalle: number;
  familia: string;
  codigo_producto: string;
  descripcion_producto: string;
  unidad: string;
};
