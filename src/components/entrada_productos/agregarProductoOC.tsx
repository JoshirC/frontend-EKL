"use client";
import React, { useEffect, useState, useMemo } from "react";
import { GET_PRODUCTOS } from "@/graphql/query";
import { useQuery } from "@apollo/client";

type DetalleOrdenCompra = {
  codigo: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  valor_total: number;
  producto: Producto | null;
};

type Producto = {
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  cantidad: number;
  cantidad_softland: number;
  trazabilidad: boolean;
};

interface AgregarProductoOCProps {
  isOpen: boolean;
  onClose: () => void;
  onAgregar: (productos: DetalleOrdenCompra[]) => void;
}

const AgregarProductoOC: React.FC<AgregarProductoOCProps> = ({
  isOpen,
  onClose,
  onAgregar,
}) => {
  // Lista de productos seleccionados
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    DetalleOrdenCompra[]
  >([]);
  // Estado para el filtro de búsqueda
  const [filtro, setFiltro] = useState<string>("");
  // Query para obtener los productos
  const { loading, error, data } = useQuery(GET_PRODUCTOS);

  const productosFiltrados = useMemo(() => {
    if (!data?.productos) return [];

    if (!filtro.trim()) return data.productos;

    const terminoBusqueda = filtro.toLowerCase();

    return data.productos.filter((producto: Producto) => {
      return (
        producto.nombre_producto.toLowerCase().includes(terminoBusqueda) ||
        producto.codigo.toLowerCase().includes(terminoBusqueda)
      );
    });
  }, [data, filtro]);

  const handleAgregarClick = () => {
    if (productosSeleccionados.length > 0) {
      onAgregar(productosSeleccionados);
      setProductosSeleccionados([]);
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white opacity-100 w-full max-w-4xl rounded-lg shadow-lg p-8 max-h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Agregar Producto(s) a Orden de Compra
        </h1>
        <h2 className="text-sm mb-4 text-center">
          Busque el producto que desea agregar a la orden de compra.
        </h2>

        {/* Buscador mejorado */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por código o  nombre del producto"
            className="border border-gray-300 rounded px-3 py-2 w-full"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          {loading && (
            <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative mb-4 mt-4">
              <strong className="font-bold">Cargando productos...</strong>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline"> {error.message}</span>
            </div>
          )}
        </div>
        {/* Lista de productos */}
        <div className="max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((producto: Producto) => (
              <div key={producto.codigo}>
                <div className="bg-gray-100 border border-gray-400 text-gray-700 px-4 py-3 rounded relative mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <h2 className="text-sm sm:text-base">
                        {producto.nombre_producto}
                      </h2>
                      <h2 className="text-gray-500 text-sm sm:text-base">
                        Código: {producto.codigo}
                      </h2>
                    </div>
                    <div className="flex justify-end flex-1">
                      <input
                        type="checkbox"
                        className="w-10 h-10"
                        checked={productosSeleccionados.some(
                          (p) => p.codigo === producto.codigo
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductosSeleccionados((prev) => [
                              ...prev,
                              {
                                codigo: producto.codigo,
                                nombre: producto.nombre_producto,
                                cantidad: 0,
                                precio_unitario: 0,
                                valor_total: 0,
                                producto: producto,
                              },
                            ]);
                          } else {
                            setProductosSeleccionados((prev) =>
                              prev.filter((p) => p.codigo !== producto.codigo)
                            );
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div>
              {filtro && (
                <p className="text-center text-gray-400">
                  No se encontraron productos que coincidan con "{filtro}"
                </p>
              )}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-4 mt-4">
          <button
            className="bg-orange-400 hover:bg-orange-500 flex-1 text-white font-semibold py-2 px-4 rounded transition duration-200"
            onClick={handleAgregarClick}
            disabled={productosSeleccionados.length === 0}
          >
            Agregar Seleccionados ({productosSeleccionados.length})
          </button>
          <button
            className="bg-gray-400 hover:bg-gray-500 flex-1 text-white font-semibold py-2 px-4 rounded transition duration-200"
            onClick={handleClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgregarProductoOC;
