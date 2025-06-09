import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_DETALLE_ACOPIO,
} from "@/graphql/mutations";
import { GET_PRODUCTOS_ASOCIADOS_POR_CODIGO } from "@/graphql/query";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "../Alert";
import CambiarProducto from "./cambiarProducto";
interface DropdownAccionesProps {
  id_detalle_orden_acopio: number;
  cantidad: number;
  isOpen: boolean;
  producto?: Producto;
  onClose: () => void;
  onProductoEnviado?: () => void;
}

type Producto = {
  codigo: string;
  nombre_producto: string;
  cantidad: number;
  unidad_medida: string;
  familia: string;
  trazabilidad: boolean;
};

interface ProductoEnviado {
  codigo: string;
  enviado: boolean;
  producto: Producto;
}

const DropdownCambioProducto: React.FC<DropdownAccionesProps> = ({
  id_detalle_orden_acopio,
  cantidad,
  isOpen,
  producto,
  onClose,
  onProductoEnviado, // Recibimos la prop
}) => {
  // Estados par alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  // Estados para el modal cambiar producto
  const [showCambiarProducto, setShowCambiarProducto] = useState(false);
  // Estados para productos
  const [productosAsociados, setProductosAsociados] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [productosEnviados, setProductosEnviados] = useState<ProductoEnviado[]>(
    []
  );
  const { rutUsuario } = useJwtStore();
  const [loadingState, setLoadingState] = useState(false);

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO
  );
  const [updateEstadoEnviado] = useMutation(UPDATE_ESTADO_DETALLE_ACOPIO);

  const { loading, error, data } = useQuery(
    GET_PRODUCTOS_ASOCIADOS_POR_CODIGO,
    {
      variables: { codigoProducto: producto?.codigo },
    }
  );

  // Filtrar productos
  const filtrarProductos = (textoBusqueda: string) => {
    if (!textoBusqueda) {
      setProductosFiltrados(productosAsociados);
      return;
    }

    const resultados = productosAsociados.filter(
      (producto) =>
        producto.nombre_producto
          .toLowerCase()
          .includes(textoBusqueda.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(textoBusqueda.toLowerCase())
    );
    setProductosFiltrados(resultados);
  };

  // Manejar cambio de cantidad
  const handleCambioCantidad = (codigo: string, valor: number) => {
    setCantidades((prev) => ({
      ...prev,
      [codigo]: valor,
    }));
  };

  // Manejar envío de producto
  const handleEnviarProducto = async (codigoProductoEnviado: string) => {
    const cantidadEnviada = cantidades[codigoProductoEnviado] || 0;

    if (cantidadEnviada <= 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad enviada debe ser mayor o igual a 0");
      setShowAlert(true);
      return;
    }

    setLoadingState(true);

    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio,
          cantidad_enviada: cantidadEnviada,
          codigo_producto_enviado: codigoProductoEnviado,
          usuario_rut: rutUsuario,
        },
      });

      await updateEstadoEnviado({
        variables: { id: id_detalle_orden_acopio },
      });

      // Marcar producto como enviado
      setProductosEnviados((prev) =>
        prev.map((p) =>
          p.codigo === codigoProductoEnviado ? { ...p, enviado: true } : p
        )
      );
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al enviar el producto, descripción: " + error);
      setShowAlert(true);
    } finally {
      setLoadingState(false);
    }
  };

  useEffect(() => {
    filtrarProductos(busqueda);
  }, [busqueda, productosAsociados]);

  useEffect(() => {
    if (data?.productosAsociados) {
      setProductosAsociados(data.productosAsociados);
      setProductosFiltrados(data.productosAsociados);
    }
  }, [data?.productosAsociados]);

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded flex justify-between items-center">
        <span>Error: {error.message}</span>
        <button
          className="ml-4 text-red-700 font-bold text-lg hover:text-red-900"
          onClick={onClose}
          aria-label="Cerrar"
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
      <CambiarProducto
        isOpen={showCambiarProducto}
        onClose={() => setShowCambiarProducto(false)}
        codigoProductoSolicitado={producto?.codigo || ""}
        producto={
          producto || {
            codigo: "",
            nombre_producto: "",
            unidad_medida: "",
            familia: "",
            trazabilidad: false,
          }
        }
      />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h2 className="text-base font-semibold sm:text-lg">
          Productos para reemplazar
        </h2>
        <div className="hidden sm:flex items-center gap-4">
          <button
            className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-200"
            onClick={() => setShowCambiarProducto(true)}
          >
            Otros productos
          </button>
          <button
            className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
            onClick={() => {
              onClose();
              onProductoEnviado && onProductoEnviado();
            }} // Llamar a la función de callback}
          >
            Cerrar
          </button>
        </div>
      </div>
      <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center font-bold mt-3">
        Producto - {producto?.nombre_producto}
      </div>
      <div className="flex flex-col sm:flex-row justify-around items-center my-3 gap-4 sm:gap-6 font-bold">
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Codigo Producto - {producto?.codigo}
        </div>
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Cantidad a enviar - {cantidad}
        </div>
      </div>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          modal={true}
        />
      )}
      {/* Campo de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por código o descripción"
        className="w-full border border-gray-300 rounded p-2 mt-4 text-sm sm:text-base"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Lista de productos */}
      {productosFiltrados.length > 0 ? (
        productosFiltrados.map((producto) => {
          const fueEnviado = productosEnviados.some(
            (p) => p.codigo === producto.codigo && p.enviado
          );

          return (
            <div
              key={producto.codigo}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg mt-2 gap-2 sm:gap-4 ${
                fueEnviado
                  ? "bg-gray-100 border-gray-500"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <div className="flex flex-col gap-1 sm:gap-2">
                <p>
                  <strong>Producto:</strong> {producto.nombre_producto}
                </p>
                <p>
                  <strong>Código:</strong> {producto.codigo}
                </p>
              </div>

              {!fueEnviado ? (
                <div className="flex flex-col justify-end  sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <input
                    type="number"
                    min="1"
                    value={cantidades[producto.codigo] || ""}
                    placeholder={producto.cantidad.toString()}
                    onChange={(e) =>
                      handleCambioCantidad(
                        producto.codigo,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 border border-gray-300 rounded p-2 text-sm sm:text-base"
                    disabled={loadingState}
                  />
                  <button
                    onClick={() => handleEnviarProducto(producto.codigo)}
                    className={`bg-blue-400 text-white font-semibold p-2 sm:px-4 rounded w-full sm:w-auto ${
                      loadingState ? "opacity-50" : "hover:bg-blue-500"
                    } transition duration-200`}
                    disabled={loadingState}
                  >
                    {loadingState ? "Enviando..." : "Reemplazar"}
                  </button>
                </div>
              ) : (
                <div className="text-gray-500 text-sm sm:text-base">
                  Producto ya enviado
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="p-4 text-center text-gray-500">
          {busqueda
            ? "No se encontraron productos que coincidan con la búsqueda"
            : "No hay productos asociados disponibles"}
        </div>
      )}

      {/* Botones para móvil */}
      <div className="flex flex-col sm:hidden gap-2 mt-4">
        <button className="bg-orange-400 text-white font-semibold p-2 rounded hover:bg-orange-500 transition duration-200 w-full">
          Buscar otro producto
        </button>
        <button
          className="bg-gray-500 text-white font-semibold p-2 rounded hover:bg-gray-600 transition duration-200 w-full"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default DropdownCambioProducto;
