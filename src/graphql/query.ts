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
        producto {
          id
          nombre_producto
          codigo
          familia
          unidad_medida
          cantidad
          cantidad_softland
          trazabilidad
        }
        cantidad
        enviado
        envios {
          id
          cantidad_enviada
          codigo_producto_enviado
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
      guiaSalida {
        id
        codigo
        fechaCreacion
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
    }
  }
`;

//Query para Guia de Salida
export const GET_GUIAS_DE_SALIDA_POR_ORDEN_ACOPIO = gql`
  query guiasDeSalidaPorOrdenAcopio($ordenAcopioId: Float!) {
    guiasDeSalidaPorOrdenAcopio(ordenAcopioId: $ordenAcopioId) {
      id
      fechaCreacion
      codigo
    }
  }
`;
export const GET_GUIA_DE_SALIDA = gql`
  query guiaDeSalida($id: Float!) {
    guiaDeSalida(id: $id) {
      id
      fechaCreacion
      codigo
      envios {
        id
        codigo_producto_enviado
        cantidad_enviada
        producto {
          nombre_producto
          codigo
          familia
          unidad_medida
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
  }
`;
// Query para Guia de Entrada
export const GET_GUIA_ENTRADA_BY_ESTADO = gql`
  query guiaEntradaByEstado($estado: String!) {
    guiaEntradaByEstado(estado: $estado) {
      id
      codigo_bodega
      numero_folio
      fecha_generacion
      codigo_proveedor
      codigo_centro_costo
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
      codigo_centro_costo
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