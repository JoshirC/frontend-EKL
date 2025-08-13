import { gql } from '@apollo/client';
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
      centroCosto
      fecha
      estado
    }
  }
`;
export const GET_ORDENES_ACOPIO_DOS_ESTADOS = gql`
  query ($centroCosto: String!, $estado1: String!, $estado2: String!) {
    ordenAcopioByCentroCostoYEstados(
      centroCosto: $centroCosto
      estado1: $estado1
      estado2: $estado2
    ) {
      id
      centroCosto
      fecha
      estado
    }
  }
`;
export const GET_CENTROS_COSTOS = gql`
  query {
    ordenAcopioDosEstados(estado1: "Pendiente", estado2: "Proceso") {
      centroCosto
      Pendiente
      Proceso
    }
  }
`;

export const GET_ORDEN_ACOPIO = gql`
  query ordenAcopio($id: Float!) {
    ordenAcopio(id: $id) {
    id
    centroCosto
    fecha
    estado
    detalles {
      id
      codigo_producto
      cantidad
      enviado
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
        }
      }
    }
    pallets {
      id
      numero_pallet
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
      detalleOrdenAcopio {
        id
        cantidad
        producto {
          nombre_producto
          codigo
          familia
          unidad_medida
        }
      }
      usuario {
        id
        nombre
        rut
      }
      codigo_producto_enviado
      cantidad_enviada
      producto {
        nombre_producto
        codigo
        familia
        unidad_medida
      }
      guiaSalida {
        numero_folio
      }
      pallet {
        id
        numero_pallet
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
export const GET_GUIAS_DE_SALIDA_SOFTLAND = gql`
  query {
    guiasDeSalidaSoftland {
      id
      codigo_bodega
      numero_folio
      fecha_generacion
      concepto_salida
      descripcion
      codigo_centro_costo
      usuario_creacion
      codigo_lugar_despacho
      valor_total
      orden {
        id
        centroCosto
        estado
      }
      envios {
        id
        cantidad_enviada
        codigo_producto_enviado
        producto {
          id
          nombre_producto
          familia
          unidad_medida
          precio_unitario
        }
      }
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
// Query para Orden de Compra
export const GET_ORDEN_COMPRA = gql`
  query ordenCompra($codigo_orden_compra: String!) {
    ordenCompra(codigo_orden_compra: $codigo_orden_compra) {
      productos{
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
      enviosDetalle{
        envioDetalle{
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