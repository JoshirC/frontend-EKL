import { gql } from '@apollo/client';

//Querys para Orden de Acopio

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