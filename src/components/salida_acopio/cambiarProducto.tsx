"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTOS } from "@/graphql/query";
import { CREATE_ENVIO_DETALLE_ORDEN_ACOPIO } from "@/graphql/mutations";
import Alert from "../Alert";
import { useJwtStore } from "@/store/jwtStore";
type Producto = {
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
  cantidad: number;
  trazabilidad: boolean;
};

interface CambiarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto;
  id_detalle_orden_acopio: number;
  cantidad_solicitada?: number;
}

const CambiarProducto: React.FC<CambiarProductoProps> = ({
  isOpen,
  onClose,
  producto,
  id_detalle_orden_acopio,
  cantidad_solicitada,
}) => {
  const [cantidades, setCantidades] = useState<Record<string, number>>({});
  const [numerosPallet, setNumerosPallet] = useState<Record<string, number>>(
    {}
  );
  const [filtro, setFiltro] = useState("");
  const [botonActivo, setBotonActivo] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [productosEnviados, setProductosEnviados] = useState<
    Record<string, boolean>
  >({});
  const { rutUsuario } = useJwtStore();

  const { loading, error, data } = useQuery(GET_PRODUCTOS);
  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO
  );

  const productosFiltrados = useMemo(() => {
    if (!data?.productos) return [];
    const termino = filtro.trim().toLowerCase();
    return termino
      ? data.productos.filter(
          (p: Producto) =>
            p.nombre_producto.toLowerCase().includes(termino) ||
            p.codigo.toLowerCase().includes(termino)
        )
      : data.productos;
  }, [data, filtro]);
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const onEnviarProducto = async (codigo: string, cantidad_sistema: number) => {
    const cantidad = cantidades[codigo];
    const numeroPallet = numerosPallet[codigo];

    if (!cantidad || cantidad <= 0) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage(
        "Debe ingresar una cantidad válida para reemplazar el producto."
      );
      return;
    }

    if (!numeroPallet || numeroPallet <= 0) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar un número de pallet válido.");
      return;
    }

    if (cantidad > cantidad_sistema) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage(
        `La cantidad a enviar (${cantidad}) no puede ser mayor a la cantidad disponible (${cantidad_sistema}).`
      );
      return;
    }

    setBotonActivo(codigo);
    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio,
          cantidad_enviada: cantidad,
          codigo_producto_enviado: codigo,
          usuario_rut: rutUsuario,
          numero_pallet: numeroPallet,
        },
      });
      setShowAlert(true);
      setAlertType("exitoso");
      setAlertMessage("Producto reemplazado exitosamente");
      setCantidades((prev) => ({ ...prev, [codigo]: 0 }));
      setProductosEnviados((prev) => ({ ...prev, [codigo]: true })); // Marcar como enviado
    } catch (error) {
      setShowAlert(true);
      setAlertType("error");
      setAlertMessage("Error al reemplazar el producto");
    }
    setBotonActivo(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-8 max-h-[80vh] overflow-y-auto relative">
        <h1 className="text-2xl font-bold text-center mb-4">
          Reemplazar {producto.nombre_producto}{" "}
          {cantidad_solicitada && `(${cantidad_solicitada})`}
        </h1>
        <p className="text-sm mb-4 text-gray-600">
          Busque el nuevo producto para reemplazar el seleccionado.
        </p>
        <button
          onClick={onClose}
          className="absolute top-3 right-8 text-gray-300 hover:text-red-500 text-4xl font-bold"
        >
          ×
        </button>
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
          placeholder="Buscar por código o nombre del producto"
          className="border border-gray-300 rounded px-3 py-2 w-full mb-4"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        {loading && <p className="mb-4">Cargando productos...</p>}
        {error && (
          <p className="mb-4 text-red-600">
            Error al cargar productos: {error.message}
          </p>
        )}

        <div className="max-h-[45vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {productosFiltrados.length > 0 ? (
            productosFiltrados.map((p: Producto) => (
              <div
                key={p.codigo}
                className={` border rounded p-4 mb-3 ${
                  productosEnviados[p.codigo]
                    ? "bg-gray-100 border-gray-500"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="font-medium">{p.nombre_producto}</p>
                    <p className="text-sm text-gray-500">Código: {p.codigo}</p>
                    <p className="text-sm text-gray-500">
                      Unidad: {p.unidad_medida}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      placeholder={p.cantidad.toString()}
                      className="w-20 border border-gray-300 rounded p-2 text-sm"
                      value={cantidades[p.codigo] || ""}
                      onChange={(e) =>
                        setCantidades((prev) => ({
                          ...prev,
                          [p.codigo]: Number(e.target.value),
                        }))
                      }
                      disabled={productosEnviados[p.codigo]}
                    />
                    <input
                      type="number"
                      min={1}
                      placeholder="Nº Pallet"
                      className="w-24 border border-gray-300 rounded p-2 text-sm"
                      value={numerosPallet[p.codigo] || ""}
                      onChange={(e) =>
                        setNumerosPallet((prev) => ({
                          ...prev,
                          [p.codigo]: Number(e.target.value),
                        }))
                      }
                      disabled={productosEnviados[p.codigo]}
                    />
                    {productosEnviados[p.codigo] ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="font-semibold text-sm">
                          Reemplazado
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => onEnviarProducto(p.codigo, p.cantidad)}
                        className={`${
                          botonActivo === p.codigo
                            ? "bg-gray-400 cursor-wait"
                            : "bg-blue-500 hover:bg-blue-600"
                        } text-white rounded px-4 py-2 font-semibold transition duration-200 flex items-center gap-2`}
                        disabled={botonActivo === p.codigo}
                      >
                        {botonActivo === p.codigo ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                            Enviando...
                          </>
                        ) : (
                          <>Reemplazar</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">
              {filtro
                ? `No se encontraron productos que coincidan con "${filtro}"`
                : "No hay productos disponibles"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CambiarProducto;
