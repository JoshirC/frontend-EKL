import { gql } from '@apollo/client';


// Mutaciones para AUTH

export const LOGIN_MUTATION = gql`
  mutation Login($loginUserInput: LoginUserInput!) {
    login(loginUserInput: $loginUserInput) {
      access_token
      user {
        rut
        rol
        nombre
      }
    }
  }
`;

//Mutaciones para Usuarios
export const CREATE_USER = gql`
  mutation CreateUser($userInput: CreateUserInput!) {
    createUser(userInput: $userInput) {
      rut
      nombre
      correo
      rol
    }
  }
`;
export const UPDATE_USER = gql`
mutation UpdateUser($updateUserInput: UpdateUserInput!) {
  updateUser(updateUserInput: $updateUserInput) {
    id
    rut
    nombre
    correo
    rol
  }
}
`;
export const EDITAR_ESTADO_ELIMINADO_USER = gql`
  mutation EditStatusUser($id: Float!) {
    editStatusUser(id: $id) {
      id
      rut
      nombre
      correo
      rol
    }
  }
`;
export const EDIT_PASSWORD_USER = gql`
  mutation EditPasswordUser(
    $rut: String!
    $editPasswordUserInput: EditPasswordUserInput!
  ) {
    editPasswordUser(rut: $rut, editPasswordUserInput: $editPasswordUserInput) {
      id
      rut
      nombre
      correo
      rol
    }
  }
`;

// Mutaciones para Envío de Detalle de Orden de Acopio

export const UPDATE_CANTIDAD_ENVIO_DETALLE = gql`
  mutation updateCantidadEnvioDetalleOrdenAcopio($id: Int!, $cantidad: Int!) {
    updateCantidadEnvioDetalleOrdenAcopio(id: $id, cantidad: $cantidad) {
      id
      codigo_producto_enviado
      cantidad_enviada
    }
  }
`;
export const CREATE_ENVIO_DETALLE_ORDEN_ACOPIO = gql`
  mutation createEnvioDetalleOrdenAcopio(
    $id_detalle_orden_acopio: Int!
    $cantidad_enviada: Int!
    $codigo_producto_enviado: String!
    $usuario_rut: String!
    $id_trazabilidad: Int
  ) {
    createEnvioDetalleOrdenAcopio(
      createEnvioDetalleOrdenAcopioInput: {
        id_detalle_orden_acopio: $id_detalle_orden_acopio
        cantidad_enviada: $cantidad_enviada
        codigo_producto_enviado: $codigo_producto_enviado
        usuario_rut: $usuario_rut
        id_trazabilidad: $id_trazabilidad
      }
    ) {
      codigo_producto_enviado
      cantidad_enviada
    }
  }
`;
export const REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO = gql`
  mutation removeEnvioDetalleOrdenAcopio($id: Int!) {
    removeEnvioDetalleOrdenAcopio(id: $id)
  }
`;

export const CREATE_MULTIPLE_ENVIOS_DETALLE = gql`
  mutation CreateManyEnvios($input: CreateMultipleEnviosInput!) {
    createManyEnvios(input: $input) {
      creados {
        id
        cantidad_enviada
        codigo_producto_enviado
      }
      fallidos {
        id_detalle_orden_acopio
        codigo_producto_enviado
        motivo
      }
    }
  }
`;


// Mutaciones para Detalle de Orden de Acopio

export const UPDATE_ESTADO_DETALLE_ACOPIO = gql`
mutation updateEstadoEnviado($id: Float!) {
  updateEstadoEnviado(id: $id) {
    enviado
  }
}
`;

// Mutaciones para Orden de Acopio

export const UPDATE_ESTADO_ORDEN_ACOPIO = gql`
  mutation ($id: Float!, $estado: String!) {
    updateEstadoOrdenAcopio(id: $id, estado: $estado) {
      id
    }
  }
`;
export const ELIMINAR_ORDEN_ACOPIO = gql`
  mutation removeOrdenAcopio($id: Float!) {
    removeOrdenAcopio(id: $id)
  }
`;
// Mutaciones para Guia de Salida
export const ELIMINAR_GUIA_SALIDA = gql`
  mutation eliminarGuiaSalida($id: Float!) {
    eliminarGuiaSalida(id: $id)
  }
`;

// Mutaciones para Productos
export const UPDATE_TRAZABILIDAD = gql`
  mutation updateTrazabilidadProducto($codigo_producto: String!) {
    updateTrazabilidadProducto(codigo_producto: $codigo_producto) {
      id
      trazabilidad
    }
  }
`;
export const CREATE_PRODUCTO_SOFTLAND = gql`
  mutation ccreateProductoSoftland($createProductoCode: String!) {
    createProductoSoftland(createProductoCode: $createProductoCode) {
      nombre_producto
      codigo
      familia
      unidad_medida
    }
  }
`;
export const ACTUALIZAR_STOCK_SOFTLAND = gql`
  mutation {
    actualizarStockSoftland
  }
`;
export const ACTUALIZAR_PRODUCTOS_SOFTLAND = gql`
  mutation {
    sincronizarProductosDesdeSoftland
  }
`;
export const AJUSTE_DE_INVENTARIO = gql`
  mutation{
    ajusteDeInventarioSoftland
  }
`;

// Mutaciones para guia de entrada
export const CREATE_GUIA_ENTRADA_WITH_DETAILS = gql`
  mutation createGuiaEntradaWithDetails($createGuiaEntradaInput: CreateGuiaEntradaInput!) {
    createGuiaEntradaWithDetails(createGuiaEntradaInput: $createGuiaEntradaInput) {
      id
      numero_orden_compra
      fecha_generacion
      estado
      guiaEntradaDetalle {
        id
        cantidad_ingresada
        precio_unitario
        producto {
          codigo
          nombre_producto
          cantidad
        }
      }
    }
  }
`;
export const UPDATE_GUIA_ENTRADA = gql`
  mutation updateGuiaEntrada($updateGuiaEntradaInput: UpdateGuiaEntradaInput!) {
    updateGuiaEntrada(updateGuiaEntradaInput: $updateGuiaEntradaInput) {
      id
    }
  }
`;
export const UPDATE_ESTADO_GUIA_ENTRADAS = gql`
  mutation updateEstadoGuiaEntrada($listId: [Int!]!, $estado: String!) {
    updateEstadoGuiaEntrada(listId: $listId, estado: $estado) {
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
    }
  }
`;
// Mutaciones para guia entrada con detalle

// Mutación para editar cantidad y precio en detalle de guía de entrada
export const UPDATE_GUIA_ENTRADA_DETALLE_CANTIDAD_Y_PRECIO = gql`
  mutation editarCantidadYPrecio($id_guia_entrada_detalle: Int!, $cantidad: Int!, $precio: Float!) {
    editarCantidadYPrecio(id_guia_entrada_detalle: $id_guia_entrada_detalle, cantidad: $cantidad, precio: $precio) {
      cantidad_ingresada
      precio_unitario
      producto {
        codigo
        nombre_producto
        cantidad
      }
    }
  }
`;

// Mutaciones para Trazabilidad
export const CREATE_TRAZABILIDAD = gql`
  mutation createTrazabilidad($createTrazabilidadInput: [CreateTrazabilidadInput!]!) {
    createTrazabilidad(createTrazabilidadInput: $createTrazabilidadInput) {
      id
      numero_lote
      cantidad_producto
      fecha_elaboracion
      fecha_vencimiento
      temperatura
      observaciones
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
  }
`;
// Mutaciones para correos
export const CORREO_AJUSTE_DE_INVENTARIO = gql`
  mutation correoAjusteDeInventario($usuario: String!, $fecha: String!) {
    correoAjusteDeInventario(usuario: $usuario, fecha: $fecha)
  }
`;
export const CORREO_DE_SUGERENCIAS = gql`
  mutation correoDeSugerencias($usuario: String!, $mensaje: String!) {
    correoDeSugerencias(usuario: $usuario, mensaje: $mensaje)
  }
`;
export const CORREO_CAMBIOS_EN_ORDEN_COMPRA = gql`
  mutation notificarCambiosEnOrden($input: NotificarCambioOrdenInput!) {
    notificarCambiosEnOrden(input: $input)
  }
`;
// Mutaciones para Salida de Productos
export const ACTUALIZAR_GUIAS_POR_ORDEN = gql`
  mutation actualizarGuiasPorOrden($input: UpdateGuiaSalidaInput!) {
    actualizarGuiasPorOrden(input: $input) {
      id
      codigo_bodega
      fecha_generacion
      concepto_salida
      codigo_cliente
    }
  }
`;