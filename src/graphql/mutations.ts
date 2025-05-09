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
  ) {
    createEnvioDetalleOrdenAcopio(
      createEnvioDetalleOrdenAcopioInput: {
        id_detalle_orden_acopio: $id_detalle_orden_acopio
        cantidad_enviada: $cantidad_enviada
        codigo_producto_enviado: $codigo_producto_enviado
        usuario_rut: $usuario_rut
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