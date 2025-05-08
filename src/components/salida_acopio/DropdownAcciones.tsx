import React, { useEffect, useState } from "react";
import { useMutation } from "@apollo/client";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_DETALLE_ACOPIO,
} from "@/graphql/mutations";
import { useJwtStore } from "@/store/jwtStore";
interface DropdownAccionesProps {
  id_detalle_orden_acopio: number;
  codigoProducto: string;
  descripcion: string;
  cantidad: number;
  isOpen: boolean;
  onClose: () => void;
  onProductoEnviado?: () => void;
}

interface Producto {
  codigo: string;
  descripcion: string;
  unidad: string;
}

interface ProductoEnviado {
  codigo: string;
  enviado: boolean;
}

const DropdownAcciones: React.FC<DropdownAccionesProps> = ({
  id_detalle_orden_acopio,
  codigoProducto,
  descripcion,
  cantidad,
  isOpen,
  onClose,
  onProductoEnviado, // Recibimos la prop
}) => {
  const [productosAsociados, setProductosAsociados] = useState<Producto[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [productosEnviados, setProductosEnviados] = useState<ProductoEnviado[]>(
    []
  );
  const { rutUsuario } = useJwtStore();
  const [loading, setLoading] = useState(false);

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO
  );
  const [updateEstadoEnviado] = useMutation(UPDATE_ESTADO_DETALLE_ACOPIO);

  // Obtener productos asociados
  const fetchProductosAsociados = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/productos-asociados/${codigoProducto}`
      );
      if (!response.ok) throw new Error("Error al obtener productos asociados");

      const data = await response.json();
      setProductosAsociados(data);
      setProductosFiltrados(data);
      // Inicializar estado de envío para cada producto
      setProductosEnviados(
        data.map(
          (p: Producto) =>
            ({ codigo: p.codigo, enviado: false } as ProductoEnviado)
        )
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Filtrar productos
  const filtrarProductos = (textoBusqueda: string) => {
    if (!textoBusqueda) {
      setProductosFiltrados(productosAsociados);
      return;
    }

    const resultados = productosAsociados.filter(
      (producto) =>
        producto.descripcion
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
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    setLoading(true);

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
      if (onProductoEnviado) {
        onProductoEnviado();
      }
    } catch (error) {
      console.error("Error al enviar producto:", error);
      alert("Ocurrió un error al enviar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    if (isOpen) fetchProductosAsociados();
  }, [isOpen, codigoProducto]);

  useEffect(() => {
    filtrarProductos(busqueda);
  }, [busqueda, productosAsociados]);

  if (!isOpen) return null;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h2 className="text-base font-semibold sm:text-lg">
          Productos para reemplazar
        </h2>
        <div className="hidden sm:flex items-center gap-4">
          <button className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-200">
            Buscar otro producto
          </button>
          <button
            className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
      <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center font-bold mt-3">
        Producto - {descripcion}
      </div>
      <div className="flex flex-col sm:flex-row justify-around items-center my-3 gap-4 sm:gap-6 font-bold">
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Codigo Producto - {codigoProducto}
        </div>
        <div className="bg-gray-200 p-3 sm:p-2 text-black rounded w-full text-center">
          Cantidad a enviar - {cantidad}
        </div>
      </div>
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
                <h2 className="text-sm sm:text-base">
                  Código: {producto.codigo}
                </h2>
                <h2 className="text-gray-500 text-sm sm:text-base">
                  {producto.descripcion}
                </h2>
              </div>

              {!fueEnviado ? (
                <div className="flex flex-col justify-end sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-1/3">
                  <input
                    type="number"
                    min="1"
                    value={cantidades[producto.codigo] || ""}
                    onChange={(e) =>
                      handleCambioCantidad(
                        producto.codigo,
                        Number(e.target.value)
                      )
                    }
                    className="w-20 border border-gray-300 rounded p-1 text-sm sm:text-base"
                    disabled={loading}
                  />
                  <button
                    onClick={() => handleEnviarProducto(producto.codigo)}
                    className={`bg-blue-400 text-white font-semibold p-2 sm:px-4 rounded w-full sm:w-auto ${
                      loading ? "opacity-50" : "hover:bg-blue-500"
                    } transition duration-200`}
                    disabled={loading}
                  >
                    {loading ? "Enviando..." : "Reemplazar"}
                  </button>
                </div>
              ) : (
                <div className="w-20"></div> // Espacio vacío para alinear
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

export default DropdownAcciones;
