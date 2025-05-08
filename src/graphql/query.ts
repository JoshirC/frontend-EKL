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
// Query para Detalle de Orden de Acopio
export const GET_ORDEN_ACOPIO = gql`
  query ordenAcopio($id: Float!) {
    ordenAcopio(id: $id) {
      id
      centroCosto
      fecha
      estado
      detalles {
        id
        familia_producto
        nombre_producto
        codigo_producto
        cantidad
        unidad
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
// Query para Envio de Detalle de Orden de Acopio
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
      }
    }
  }
`;