import { gql } from "@apollo/client";
//Querys para Usuarios
export const GET_USUARIOS_NO_ELIMINADOS = gql`
  query GetUsuariosNoEliminados {
    usersNoEliminados {
      id
      rut
      nombre
      correo
      rol
    }
  }
`;
export const GET_USUARIOS_ELIMINADOS = gql`
  query GetUsuariosEliminados {
    usersEliminados {
      id
      rut
      nombre
      correo
      rol
    }
  }
`;
export const GET_USUARIO_BY_ID = gql`
  query GetUsuarioById($id: Float!) {
    user(id: $id) {
      id
      rut
      nombre
      correo
      rol
    }
  }
`;

//Querys para Orden de Acopio
export const GET_ORDENES_ACOPIO = gql`
  query ($estado: String!) {
    ordenAcopiosByEstado(estado: $estado) {
      id
      centro_costo
      fecha_despacho
      codigo_centro_costo
      estado
      tipo
    }
  }
`;
export const GET_ORDENES_ACOPIO_DOS_ESTADOS = gql`
  query ($centroCosto: String!, $estados: [String!]!) {
    ordenAcopioByCentroCostoYMultiplesEstados(
      centroCosto: $centroCosto
      estados: $estados
    ) {
      id
      centro_costo
      fecha_despacho
      estado
      tipo
      detalles {
        id
        codigo_producto
        familia_planilla
        cantidad
        producto {
          codigo
          nombre_producto
          unidad_medida
        }
      }
    }
  }
`;

export const GET_ORDENES_ACOPIO_BY_CENTRO_COSTO_Y_ESTADOS = gql`
  query ($centroCosto: String!, $estados: [String!]!) {
    ordenAcopioByCentroCostoYMultiplesEstados(
      centroCosto: $centroCosto
      estados: $estados
    ) {
      id
      centro_costo
      fecha_despacho
      estado
      tipo
      detalles {
        id
        codigo_producto
        cantidad
        familia_planilla
        producto {
          codigo
          nombre_producto
          unidad_medida
        }
      }
    }
  }
`;
export const GET_CENTROS_COSTOS = gql`
  query ($estados: [String!]!) {
    ordenAcopioMultiplesEstados(estados: $estados) {
      centro_costo
      Pendiente
      Proceso
      Subir
      Cerrado
      Revision
      Parcial
    }
  }
`;

export const GET_ORDENES_ACOPIO_MULTIPLES_ESTADOS = gql`
  query ($estados: [String!]!) {
    ordenAcopioMultiplesEstados(estados: $estados) {
      centro_costo
      Comprar
      Pendiente
      Proceso
      Subir
      Cerrado
      Revision
      Parcial
    }
  }
`;

export const GET_ORDEN_ACOPIO = gql`
  query ordenAcopio($id: Float!) {
    ordenAcopio(id: $id) {
      id
      centro_costo
      fecha_despacho
      estado
      tipo
      detalles {
        id
        codigo_producto
        cantidad
        familia_planilla
        producto {
          codigo
          nombre_producto
          familia
          unidad_medida
          precio_unitario
          cantidad
        }
        envios {
          id
          cantidad_enviada
          codigo_producto_enviado
          pallet {
            numero_pallet
            estado
          }
        }
      }
      pallets {
        id
        numero_pallet
        estado
      }
    }
  }
`;

export const GET_ORDEN_ACOPIO_BY_ID_AND_ESTADO_PALLET = gql`
  query ordenAcopioByIdAndEstadoPallet($id: Float!, $estado: String) {
    ordenAcopioByIdAndEstadoPallet(id: $id, estado: $estado) {
      id
      centro_costo
      fecha_despacho
      tipo
      estado
      detalles {
        id
        cantidad
        envios {
          id
          cantidad_enviada
          pallet {
            id
            estado
            numero_pallet
          }
          producto {
            codigo
            nombre_producto
            familia
            unidad_medida
            precio_unitario
            cantidad
          }
        }
        producto {
          codigo
          nombre_producto
          familia
          unidad_medida
          precio_unitario
          cantidad
        }
      }
    }
  }
`;

// Query para Detalle de Orden de Acopio
export const GET_DETALLE_ORDEN_ACOPIO_BY_ID = gql`
  query detalleOrdenAcopioID($id: Int!) {
    detalleOrdenAcopioID(id: $id) {
      codigo_producto
      cantidad
      familia_planilla
      producto {
        nombre_producto
        familia
        unidad_medida
      }
      envios {
        id
        cantidad_enviada
        codigo_producto_enviado
        producto {
          id
          nombre_producto
          codigo
          familia
          unidad_medida
          cantidad
        }
        pallet {
          id
          numero_pallet
          estado
        }
      }
    }
  }
`;
// Query para Envio de Detalle de Orden de Acopio
export const GET_ENVIO_DETALLE_ORDEN_ACOPIO_BY_ID_ORDEN = gql`
  query envioDetalleOrdenAcopioByIdOrden($id_orden_acopio: Float!) {
    envioDetalleOrdenAcopioByIdOrden(id_orden_acopio: $id_orden_acopio) {
      id
      codigo_producto_enviado
      cantidad_enviada
      detalleOrdenAcopio {
        id
        codigo_producto
        cantidad
        familia_planilla
        producto {
          codigo
          nombre_producto
        }
      }
      usuario {
        nombre
      }
      producto {
        codigo
        nombre_producto
        familia
        cantidad
        trazabilidad
      }
      pallet {
        numero_pallet
        guiasSalida {
          numero_folio
        }
      }
      trazabilidad {
        id
        numero_lote
        fecha_elaboracion
        fecha_vencimiento
        temperatura
        observaciones
      }
    }
  }
`;

//Query para Guia de Salida
export const GET_GUIAS_DE_SALIDA_POR_ORDEN_ACOPIO = gql`
  query guiasDeSalidaPorOrdenAcopio($ordenAcopioId: Float!) {
    guiasDeSalidaPorOrdenAcopio(ordenAcopioId: $ordenAcopioId) {
      id
    }
  }
`;
export const GET_GUIA_SALIDA_CON_FOLIO = gql`
  query obtenerGuiaSalidaConFolio($id: Float!) {
    obtenerGuiaSalidaConFolio(id: $id) {
      guiaSalida {
        id
        codigo_bodega
        numero_folio
        fecha_generacion
        concepto_salida
        descripcion
        codigo_centro_costo
        usuario_creacion
        valor_total
        envios {
          id
          cantidad_enviada
          codigo_producto_enviado
          producto {
            nombre_producto
            codigo
            familia
            unidad_medida
            precio_unitario
          }
        }
      }
      ultimoFolio
    }
  }
`;

// Query para Productos
export const GET_PRODUCTOS = gql`
  query {
    productos {
      id
      nombre_producto
      codigo
      familia
      unidad_medida
      cantidad
      cantidad_softland
      cantidad_emergencia
      cantidad_oc
      trazabilidad
      precio_unitario
    }
  }
`;
export const GET_PRODUCTOS_ASOCIADOS_POR_CODIGO = gql`
  query productosAsociados($codigoProducto: String!) {
    productosAsociados(codigoProducto: $codigoProducto) {
      id
      codigo
      nombre_producto
      familia
      unidad_medida
      cantidad
      cantidad_softland
      trazabilidad
    }
  }
`;
export const BUSCAR_PRODUCTO_SOFTLAND = gql`
  query BuscarProductoSoftland($codigo: String!) {
    buscarProductoSoftland(codigo_producto: $codigo) {
      codigo
      nombre_producto
      familia
      unidad_medida
      cantidad_softland
    }
  }
`;
// Query para Orden de Compra
export const GET_ORDEN_COMPRA = gql`
  query ordenCompra($codigo_orden_compra: String!) {
    ordenCompra(codigo_orden_compra: $codigo_orden_compra) {
      productos {
        codigo
        nombre
        cantidad
        precio_unitario
        valor_total
        producto {
          nombre_producto
          familia
          unidad_medida
          cantidad
          cantidad_softland
          trazabilidad
        }
      }
      ultimo_num_inter
      rut_proveedor
    }
  }
`;
export const GET_OC_EN_SEMANA = gql`
  query {
    obtenerOCenSemana {
      NumInterOC
      NumOC
      FecFinalOC
      NomCon
    }
  }
`;
export const GET_DETALLE_OC_BY_ID = gql`
  query DetalleOC($numInterOC: Int!) {
    detalleOC(numInterOC: $numInterOC) {
      CodProd
      DetProd
      Cantidad
      PrecioUnit
    }
  }
`;
// Query para Guia de Entrada
export const GET_GUIA_ENTRADA_BY_ESTADO = gql`
  query guiaEntradaByEstado($estado: String!) {
    guiaEntradaByEstado(estado: $estado) {
      id
      codigo_bodega
      numero_folio
      estado
      fecha_generacion
      codigo_proveedor
      observacion
      numero_factura
      fecha_factura
      numero_orden_compra
      guiaEntradaDetalle {
        id
        producto {
          codigo
          nombre_producto
        }
        cantidad_ingresada
        precio_unitario
      }
    }
  }
`;
export const GET_GUIA_ENTRADA_BY_ID = gql`
  query guiaEntrada($id: Int!) {
    guiaEntrada(id: $id) {
      id
      codigo_bodega
      numero_folio
      fecha_generacion
      codigo_proveedor
      observacion
      numero_factura
      fecha_factura
      numero_orden_compra
      estado
      guiaEntradaDetalle {
        id
        cantidad_ingresada
        precio_unitario
        id_guia_entrada
        producto {
          id
          codigo
          nombre_producto
          familia
          unidad_medida
        }
      }
    }
  }
`;
// Query para Trazabilidad
export const GET_LISTA_TRAZABILIDAD = gql`
  query {
    trazabilidadesConEnvios {
      trazabilidad {
        id
        numero_lote
        cantidad_producto
        fecha_elaboracion
        fecha_vencimiento
        temperatura
        observaciones
        codigo_proveedor
        numero_factura
        producto {
          id
          codigo
          nombre_producto
        }
        usuario {
          id
          nombre
          rut
        }
      }
      enviosDetalle {
        envioDetalle {
          id
          cantidad_enviada
        }
        centroCosto
        fecha
      }
    }
  }
`;
export const GET_TRAZABILIDAD_BY_CODIGO_PRODUCTO = gql`
  query trazabilidadByCodigoProducto($codigo_producto: String!) {
    trazabilidadByCodigoProducto(codigo_producto: $codigo_producto) {
      id
      numero_lote
      cantidad_producto
      fecha_elaboracion
      fecha_vencimiento
      temperatura
      observaciones
      fecha_registro
      codigo_proveedor
      numero_factura
      usuario {
        id
        nombre
        rut
      }
      producto {
        id
        codigo
        nombre_producto
      }
    }
  }
`;

export const GET_GUIAS_SALIDA_BY_IDS = gql`
  query GetGuiasSalidaPorIds($ids: [Float!]!) {
    guiasDeSalidaPorIds(ids: $ids) {
      id
      codigo_bodega
      numero_folio
      fecha_generacion
      concepto_salida
      descripcion
      codigo_centro_costo
      envios {
        id
        cantidad_enviada
        codigo_producto_enviado
        producto {
          codigo
          nombre_producto
          unidad_medida
        }
      }
    }
  }
`;

// Query para Consolidado
export const GET_RESUMEN_ORDEN_POR_TIPO = gql`
  query {
    resumenTipoOrden {
      tipo
      cantidad
    }
  }
`;
export const CONSOLIDADO_POR_TIPO_ORDEN = gql`
  query ($tipoOrden: String!) {
    consolidadoPorTipoOrden(tipoOrden: $tipoOrden) {
      id
      fecha_inicio
      fecha_termino
      estado
      ordenesAcopio {
        id
        tipo
        estado
      }
    }
  }
`;
export const CONSOLIDADO_SS_SR_BY_ID = gql`
  query ($id: Int!) {
    consolidadoPorId(id: $id) {
      estado
      fecha_inicio
      fecha_termino
      productos {
        familia
        codigo_producto
        descripcion_producto
        unidad
        stock_actual
        stock_emergencia
        stock_oc
        cantidad_a_enviar
        compra_recomendada
        centros {
          centro
          cantidad
        }
        total
      }
      centrosUnicos
    }
  }
`;

export const CONSOLIDADO_CL_BY_ID = gql`
  query GetConsolidadoSolicitudPorId($id: Int!) {
    consolidadoSolicitudPorId(id: $id) {
      id
      estado
      fecha_inicio
      fecha_termino
      centros {
        centro
        productos {
          familia
          codigo_producto
          descripcion_producto
          unidad
          Lu
          Ma
          Mi
          Ju
          Vi
          Sa
          total
        }
      }
    }
  }
`;
export const CONSOLIDADO_SM_BY_ID = gql`
  query GetConsolidadoSolicitudSemanasPorId($id: Int!) {
    consolidadoSolicitudSemanasPorId(id: $id) {
      id
      estado
      fecha_inicio
      fecha_termino
      centros {
        centro
        productos {
          familia
          codigo_producto
          descripcion_producto
          unidad
          Semana1
          Semana2
          Semana3
          Semana4
          Semana5
          total
        }
      }
    }
  }
`;
export const GET_CONSOLIDADO_CERRADOS = gql`
  query {
    consolidadosCerrados {
      id
      fecha_inicio
      fecha_termino
      estado
      ordenesAcopio {
        id
        estado
        tipo
      }
    }
  }
`;
