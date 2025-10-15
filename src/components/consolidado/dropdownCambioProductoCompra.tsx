"use client";
import React, { useMemo, useState } from "react";
import { ProductoConsolidado, Producto } from "@/types/graphql";
import { GET_PRODUCTOS_ASOCIADOS_POR_CODIGO } from "@/graphql/query";
import { UPDATE_PRODUCTO_CONSOLIDADO } from "@/graphql/mutations";

import { useQuery, useMutation } from "@apollo/client";
import Alert from "../Alert";

interface DropdownCambioProductoCompraProps {
  id_consolidado: number;
  producto_seleccionado: ProductoConsolidado | null;
  onClose: () => void;
  onProductoChange?: () => void;
}

const DropdownCambioProductoCompra: React.FC<
  DropdownCambioProductoCompraProps
> = ({ id_consolidado, producto_seleccionado, onClose, onProductoChange }) => {
  const { loading, error, data } = useQuery(
    GET_PRODUCTOS_ASOCIADOS_POR_CODIGO,
    {
      variables: {
        codigoProducto: producto_seleccionado?.codigo_producto || "",
      },
    }
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const productosAsociados: Producto[] = useMemo(() => {
    return data?.productosAsociados || [];
  }, [data]);

  const familias = [
    "ABARROTES",
    "CONFITERIA",
    "BEBESTIBLES",
    "DESECHABLES",
    "EPP",
    "FRUTAS Y VERDURAS",
    "MATERIALES ASEO Y EPP",
    "QUÍMICOS",
    "AVES",
    "CECINAS",
    "CERDO",
    "LÁCTEOS Y HUEVOS",
    "PANADERÍA Y PASTELERÍA",
    "PESCADOS Y MARISCOS",
    "CECINAS Y EMBUTIDOS",
    "CERDOS",
    "VACUNO",
    "HUEVOS Y LACTEOS",
  ];

  const [selectedFamilias, setSelectedFamilias] = useState<
    Record<number, string>
  >({});

  const [updateProductoConsolidado] = useMutation(UPDATE_PRODUCTO_CONSOLIDADO);

  const handleFamiliaChange = (productoId: number, value: string) => {
    setSelectedFamilias((prev) => ({
      ...prev,
      [productoId]: value,
    }));
  };

  const handleReemplazar = async (productoId: number) => {
    const familiaSeleccionada = selectedFamilias[productoId];
    if (!familiaSeleccionada) {
      setAlertType("advertencia");
      setAlertMessage("Debes seleccionar una familia antes de reemplazar.");
      setShowAlert(true);
      return;
    }
    try {
      await updateProductoConsolidado({
        variables: {
          id_consolidado: id_consolidado,
          codigo_producto: producto_seleccionado?.codigo_producto || "",
          codigo_producto_cambio:
            productosAsociados.find((p) => p.id === productoId)?.codigo || "",
          familia_planilla: familiaSeleccionada,
        },
      });
      setAlertType("exitoso");
      setAlertMessage("Producto reemplazado exitosamente.");
      setShowAlert(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al reemplazar el producto. Inténtalo de nuevo.");
      setShowAlert(true);
      console.error("Error al reemplazar producto:", error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-4 px-6 m-1">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold">Productos para reemplazar</h2>
        <div className="hidden sm:flex gap-4">
          <button className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500">
            Otros productos
          </button>
          <button
            className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600"
            onClick={() => {
              onClose();
              setShowAlert(false);
              onProductoChange?.();
            }}
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Datos del producto actual */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-6">
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm text-start">
          <p className="text-sm font-medium">Familia</p>
          <p className="font-semibold text-gray-800">
            {producto_seleccionado?.familia ?? "N/A"}
          </p>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm text-start">
          <p className="text-sm font-medium">Código</p>
          <p className="font-semibold text-gray-800">
            {producto_seleccionado?.codigo_producto ?? "N/A"}
          </p>
        </div>
        <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm text-start">
          <p className="text-sm font-medium">Descripción</p>
          <p className="font-semibold text-gray-800">
            {producto_seleccionado?.descripcion_producto ?? "N/A"}
          </p>
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
      {/* Lista de productos asociados */}
      <div>
        {productosAsociados.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No existen productos en el árbol del código.
          </div>
        ) : (
          productosAsociados.map((producto) => (
            <div
              key={producto.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200"
            >
              <div className="text-start">
                <p>
                  <strong>Producto:</strong> {producto.nombre_producto}{" "}
                  {producto.unidad_medida}
                </p>
                <p>
                  <strong>Código:</strong> {producto.codigo}
                </p>
              </div>
              <div className="space-x-3 flex items-center">
                <select
                  className="border border-gray-300 rounded px-4 py-3"
                  value={selectedFamilias[producto.id] || ""}
                  onChange={(e) =>
                    handleFamiliaChange(producto.id, e.target.value)
                  }
                >
                  <option value="">Seleccione una familia</option>
                  {familias.map((familia) => (
                    <option key={familia} value={familia}>
                      {familia}
                    </option>
                  ))}
                </select>
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white rounded font-semibold px-4 py-2"
                  onClick={() => handleReemplazar(producto.id)}
                >
                  Reemplazar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DropdownCambioProductoCompra;
