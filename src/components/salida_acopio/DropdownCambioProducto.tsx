import React, { useEffect, useState, useMemo } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_DETALLE_ACOPIO,
} from "@/graphql/mutations";
import { GET_PRODUCTOS_ASOCIADOS_POR_CODIGO } from "@/graphql/query";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "../Alert";
import CambiarProducto from "./cambiarProducto";
import { Producto } from "@/types/graphql";
import Confirmacion from "../confirmacion";

interface DropdownAccionesProps {
  id_detalle_orden_acopio: number;
  cantidad: number;
  isOpen: boolean;
  producto?: Producto;
  onClose: () => void;
  onProductoEnviado?: () => void;
}

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
  onProductoEnviado,
}) => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [showCambiarProducto, setShowCambiarProducto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [codigoReemplazo, setCodigoReemplazo] = useState("");
  const [cantidadReemplazo, setCantidadReemplazo] = useState(0);
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [numerosPallet, setNumerosPallet] = useState<Record<string, number>>(
    {}
  );
  const [productosEnviados, setProductosEnviados] = useState<ProductoEnviado[]>(
    []
  );
  const [loadingState, setLoadingState] = useState(false);

  const { rutUsuario } = useJwtStore();

  const { loading, error, data } = useQuery(
    GET_PRODUCTOS_ASOCIADOS_POR_CODIGO,
    {
      variables: { codigoProducto: producto?.codigo },
    }
  );

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO
  );

  const productosAsociados: Producto[] = useMemo(() => {
    return data?.productosAsociados || [];
  }, [data]);

  const productosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return productosAsociados;
    const lowerSearch = busqueda.toLowerCase();
    return productosAsociados.filter(
      (p) =>
        p.nombre_producto.toLowerCase().includes(lowerSearch) ||
        p.codigo.toLowerCase().includes(lowerSearch)
    );
  }, [busqueda, productosAsociados]);

  useEffect(() => {
    if (productosAsociados.length > 0) {
      setProductosEnviados(
        productosAsociados.map((prod) => ({
          codigo: prod.codigo,
          enviado: false,
          producto: prod,
        }))
      );
    }
  }, [productosAsociados]);

  const handleEnviarProducto = async (
    codigo: string,
    cantidad_sistema: number
  ) => {
    const cantidadEnviada = cantidades[codigo] || 0;
    const numeroPallet = numerosPallet[codigo] || 0;

    if (cantidadEnviada <= 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad enviada debe ser mayor a 0");
      return setShowAlert(true);
    }

    if (numeroPallet <= 0) {
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar un número de pallet válido");
      return setShowAlert(true);
    }

    if (cantidadEnviada > cantidad_sistema) {
      setAlertType("advertencia");
      setAlertMessage(
        `No puede enviar más de la cantidad existente (${cantidad_sistema})`
      );
      return setShowAlert(true);
    }

    setLoadingState(true);
    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio,
          cantidad_enviada: cantidadEnviada,
          codigo_producto_enviado: codigo,
          usuario_rut: rutUsuario,
          numero_pallet: numeroPallet,
        },
      });
      setAlertType("exitoso");
      setAlertMessage("Producto enviado exitosamente");
      setShowAlert(true);
      setProductosEnviados((prev) =>
        prev.map((p) => (p.codigo === codigo ? { ...p, enviado: true } : p))
      );
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al enviar el producto: " + error);
      setShowAlert(true);
    } finally {
      setLoadingState(false);
    }
  };

  const handleConfirmacion = (confirmed: boolean) => {
    if (confirmed) {
      handleEnviarProducto(codigoReemplazo, cantidad);
    }
    setShowConfirmacion(false);
  };

  const renderProducto = (producto: Producto) => {
    const enviado = productosEnviados.find(
      (p) => p.codigo === producto.codigo
    )?.enviado;

    return (
      <div
        key={producto.codigo}
        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 border rounded-lg mt-2 gap-2 sm:gap-4 ${
          enviado
            ? "bg-gray-100 border-gray-500"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div>
          <p>
            <strong>Producto:</strong> {producto.nombre_producto}
          </p>
          <p>
            <strong>Código:</strong> {producto.codigo}
          </p>
          <p>
            <strong>Unidad de Medida:</strong> {producto.unidad_medida}
          </p>
        </div>
        {!enviado ? (
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <input
              type="number"
              min="1"
              value={cantidades[producto.codigo] || ""}
              placeholder={producto.cantidad.toString()}
              onChange={(e) => {
                setCantidades((prev) => ({
                  ...prev,
                  [producto.codigo]: Number(e.target.value),
                }));
                setCantidadReemplazo(Number(e.target.value));
              }}
              className="w-20 border border-gray-300 rounded p-2 text-sm"
              disabled={loadingState}
            />
            <input
              type="number"
              min="1"
              value={numerosPallet[producto.codigo] || ""}
              placeholder="Nº Pallet"
              onChange={(e) =>
                setNumerosPallet((prev) => ({
                  ...prev,
                  [producto.codigo]: Number(e.target.value),
                }))
              }
              className="w-24 border border-gray-300 rounded p-2 text-sm"
              disabled={loadingState}
            />
            <button
              onClick={() => {
                if (producto.cantidad > cantidad * 3) {
                  setCodigoReemplazo(producto.codigo);
                  setShowConfirmacion(true);
                } else {
                  handleEnviarProducto(producto.codigo, producto.cantidad);
                }
              }}
              className={`${
                loadingState ? "bg-gray-400" : "bg-blue-400 hover:bg-blue-500"
              } text-white font-semibold p-2 sm:px-4 rounded w-full sm:w-auto transition duration-200`}
              disabled={loadingState}
            >
              Reemplazar
            </button>
          </div>
        ) : (
          <div className="text-gray-500 font-semibold">
            Cantidad enviada: {cantidades[producto.codigo] || producto.cantidad}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="p-10 bg-white rounded shadow">
        <p>Cargando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded flex justify-between items-center">
        <span>Error: {error.message}</span>
        <button
          className="ml-4 font-bold hover:text-red-900"
          onClick={onClose}
          aria-label="Cerrar"
        >
          x
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-4 px-6 m-1">
      <CambiarProducto
        isOpen={showCambiarProducto}
        onClose={() => {
          setShowCambiarProducto(false);
          onClose(); // Cierra el modal padre
          onProductoEnviado?.();
        }}
        producto={
          producto || {
            codigo: "",
            nombre_producto: "",
            unidad_medida: "",
            familia: "",
            cantidad: 0,
            trazabilidad: false,
          }
        }
        id_detalle_orden_acopio={id_detalle_orden_acopio}
        cantidad_solicitada={cantidad}
      />
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Confirmación de Cantidades"
          mensaje={`La cantidad a enviar (${cantidadReemplazo}) excede significativamente la solicitada (${cantidad}). ¿Desea continuar?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">Productos para reemplazar</h2>
        <div className="hidden sm:flex gap-4">
          <button
            className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500"
            onClick={() => setShowCambiarProducto(true)}
          >
            Otros productos
          </button>
          <button
            className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => {
              onClose();
              onProductoEnviado?.();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-4">
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-medium">Producto</p>
              <p className="font-semibold text-gray-800">
                {producto?.nombre_producto ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-medium">Código</p>
              <p className="font-semibold text-gray-800">
                {producto?.codigo ?? "N/A"}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-medium">Cantidad</p>
              <p className="font-semibold text-gray-800">
                {cantidad ?? "N/A"} {producto?.unidad_medida ?? "N/A"}
              </p>
            </div>
          </div>
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

      <input
        type="text"
        placeholder="Buscar por código o descripción"
        className="w-full border border-gray-300 rounded p-2 mt-4 mb-4 text-sm"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="mt-2">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map(renderProducto)
        ) : (
          <div className="p-4 text-center text-gray-500">
            {busqueda
              ? "No se encontraron productos que coincidan con la búsqueda"
              : "No hay productos asociados disponibles"}
          </div>
        )}
      </div>

      {/* Botones para móvil */}
      <div className="sm:hidden mt-4 flex flex-col gap-2">
        <button
          className="bg-orange-400 text-white font-semibold p-2 rounded hover:bg-orange-500"
          onClick={() => setShowCambiarProducto(true)}
        >
          Buscar otro producto
        </button>
        <button
          className="bg-gray-500 text-white font-semibold p-2 rounded hover:bg-gray-600"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default DropdownCambioProducto;
