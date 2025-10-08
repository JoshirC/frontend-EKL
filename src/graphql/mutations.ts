import { gql } from "@apollo/client";

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
  mutation updateCantidadEnvioDetalleOrdenAcopio(
    $updateEnvioDetalleOrdenAcopioInput: UpdateEnvioDetalleOrdenAcopioInput!
  ) {
    updateCantidadEnvioDetalleOrdenAcopio(
      updateEnvioDetalleOrdenAcopioInput: $updateEnvioDetalleOrdenAcopioInput
    ) {
      id
      cantidad_enviada
      pallet {
        id
        numero_pallet
      }
    }
  }
`;
export const CREATE_ENVIO_DETALLE_ORDEN_ACOPIO = gql`
  mutation createEnvioDetalleOrdenAcopio(
    $id_detalle_orden_acopio: Int!
    $cantidad_enviada: Float!
    $codigo_producto_enviado: String!
    $usuario_rut: String!
    $numero_pallet: Int!
    $id_trazabilidad: Int
  ) {
    createEnvioDetalleOrdenAcopio(
      createEnvioDetalleOrdenAcopioInput: {
        id_detalle_orden_acopio: $id_detalle_orden_acopio
        cantidad_enviada: $cantidad_enviada
        codigo_producto_enviado: $codigo_producto_enviado
        usuario_rut: $usuario_rut
        numero_pallet: $numero_pallet
        id_trazabilidad: $id_trazabilidad
      }
    ) {
      id
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
        numero_pallet
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
export const ELIMINAR_LISTA_ORDEN_ACOPIO = gql`
  mutation RemoveMultipleOrders($orderIds: [Float!]!) {
    removeMultipleOrdenAcopio(ids: $orderIds)
  }
`;
export const EDITAR_LISTA_ORDEN_ACOPIO = gql`
  mutation EditMultipleOrderStatus($orderIds: [Float!]!, $newStatus: String!) {
    editMultipleStatusOrdenAcopio(ids: $orderIds, estado: $newStatus)
  }
`;

// Mutaciones para Guia de Salida
export const ELIMINAR_GUIA_SALIDA = gql`
  mutation eliminarGuiaSalida($id: Float!) {
    eliminarGuiaSalida(id: $id)
  }
`;

export const CREAR_GUIAS_POR_PALLETS = gql`
  mutation crearGuiasPorPallets($input: CreateGuiasPorPalletsInput!) {
    crearGuiasPorPallets(input: $input) {
      guias_creadas_ids
      total_guias_creadas
      errores
    }
  }
`;

// Mutaciones para Pallets
export const CAMBIO_ESTADO_PALLET = gql`
  mutation CambioEstadoPallet($ids: [Int!]!, $estado: String!) {
    cambioEstadoPallet(ids: $ids, estado: $estado)
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
export const ACTUALIZAR_INFO_PRODUCTOS_SOFTLAND = gql`
  mutation {
    actualizarInformacionProductos
  }
`;
export const AJUSTE_DE_INVENTARIO = gql`
  mutation {
    ajusteDeInventarioSoftland
  }
`;
export const UPDATE_STOCK_EMERGENCIA = gql`
  mutation updateStockEmergencia($codigo: String!, $nuevaCantidad: Int!) {
    updateStockEmergencia(codigo: $codigo, nuevaCantidad: $nuevaCantidad) {
      id
      codigo
      nombre_producto
      cantidad_emergencia
    }
  }
`;
// Mutaciones para guia de entrada
export const CREATE_GUIA_ENTRADA_WITH_DETAILS = gql`
  mutation createGuiaEntradaWithDetails(
    $createGuiaEntradaInput: CreateGuiaEntradaInput!
  ) {
    createGuiaEntradaWithDetails(
      createGuiaEntradaInput: $createGuiaEntradaInput
    ) {
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
    }
  }
`;
// Mutaciones para guia entrada con detalle

// Mutación para editar cantidad y precio en detalle de guía de entrada
export const UPDATE_GUIA_ENTRADA_DETALLE_CANTIDAD_Y_PRECIO = gql`
  mutation editarCantidadYPrecio(
    $id_guia_entrada_detalle: Int!
    $cantidad: Float!
    $precio: Float!
  ) {
    editarCantidadYPrecio(
      id_guia_entrada_detalle: $id_guia_entrada_detalle
      cantidad: $cantidad
      precio: $precio
    ) {
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
  mutation createTrazabilidad(
    $createTrazabilidadInput: [CreateTrazabilidadInput!]!
  ) {
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
      descripcion
    }
  }
`;
export const ACTUALIZAR_STOCK_PENDIENTE_OC = gql`
  mutation calculoStockOC {
    calculoStockOC
  }
`;
// Mutaciones para detalle orden de acopio
export const EDITAR_CANTIDAD_DETALLE_ORDEN_ACOPIO = gql`
  mutation updateDetalleProducto($id: Int!, $cantidad: Float!) {
    updateDetalleProducto(id: $id, cantidad: $cantidad) {
      id
    }
  }
`;
export const ELIMINAR_PRODUCTO_DETALLE_ORDEN_ACOPIO = gql`
  mutation deleteDetalleOrdenAcopio($id: Int!) {
    deleteDetalleOrdenAcopio(id: $id)
  }
`;
// Mutaciones para Envio Correos
export const ENVIAR_CORREO_GUIA_ENTRADA = gql`
  mutation enviarExcelGuias {
    enviarExcelGuias
  }
`;
export const ENVIAR_CORREO_GUIA_SALIDA = gql`
  mutation EnviarExcelSalidas($ids: [Float!]!) {
    enviarExcelSalidas(ids: $ids)
  }
`;
export const ENVIAR_CORREO_CONSOLIDADO_SS_SR = gql`
  mutation ($id_consolidado: Float!) {
    generarExcelConsolidadoSSSR(id_consolidado: $id_consolidado)
  }
`;
export const ENVIAR_CORREO_CONSOLIDADO_CL = gql`
  mutation GenerarExcelConsolidadoSolicitudCL($id_consolidado: Float!) {
    generarExcelConsolidadoSolicitudCL(id_consolidado: $id_consolidado)
  }
`;
export const ENVIAR_CORREO_CONSOLIDADO_SM = gql`
  mutation GenerarExcelConsolidadoSolicitudSM($id_consolidado: Float!) {
    generarExcelConsolidadoSolicitudSM(id_consolidado: $id_consolidado)
  }
`;
// Mutaciones para consolidado

export const CAMBIAR_ESTADO_ORDENES_ACOPIO_CONSOLIDADO = gql`
  mutation ($id: Int!, $nuevoEstado: String!) {
    cambiarEstadoOrdenesAcopioByIDConsolidado(
      id: $id
      nuevoEstado: $nuevoEstado
    )
  }
`;
export const CREAR_CONSOLIDADO_SEMANA1_SM = gql`
  mutation CrearConsolidadoSemana1SM($id: Int!) {
    crearConsolidadoSemana1SM(id: $id) {
      id
      fecha_inicio
      fecha_termino
      estado
      ordenesAcopio {
        id
        fecha_despacho
        centro_costo
        estado
        tipo
        detalles {
          codigo_producto
          cantidad
        }
      }
    }
  }
`;
