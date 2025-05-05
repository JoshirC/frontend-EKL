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
  $id_detalle_orden_acopio: Float!
  $cantidad_enviada: Float!
  $codigo_producto_enviado: String!
) {
  createEnvioDetalleOrdenAcopio(
    createEnvioDetalleOrdenAcopioInput: {
      id_detalle_orden_acopio: $id_detalle_orden_acopio
      cantidad_enviada: $cantidad_enviada
      codigo_producto_enviado: $codigo_producto_enviado
    }
  ) {
    id
    cantidad_enviada
    codigo_producto_enviado
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