"use client";

import React, { useState } from "react";
import { Producto } from "@/types/graphql";
import { useQuery, useMutation } from "@apollo/client";
import { BUSCAR_PRODUCTO_SOFTLAND } from "@/graphql/query";
import { CREATE_PRODUCTO_SOFTLAND } from "@/graphql/mutations";
import Alert from "../Alert";

interface CrearProductoProps {
  isOpen: boolean;
  onClose: () => void;
  onProductCreated?: () => void;
}

const CrearProducto: React.FC<CrearProductoProps> = ({
  isOpen,
  onClose,
  onProductCreated,
}) => {
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [typeAlert, setTypeAlert] = useState<"exitoso" | "error">("exitoso");
  const [codigoProducto, setCodigoProducto] = useState("");
  const [buscarProducto, setBuscarProducto] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { data, loading, error } = useQuery(BUSCAR_PRODUCTO_SOFTLAND, {
    variables: { codigo: buscarProducto },
    skip: !buscarProducto,
  });
  const [createProductoSoftland] = useMutation(CREATE_PRODUCTO_SOFTLAND, {
    onCompleted: (data) => {
      setAlertMessage("Producto creado exitosamente.");
      setTypeAlert("exitoso");
      setShowAlert(true);
      setIsCreating(false);
      // Limpiar la información del producto
      setCodigoProducto("");
      setBuscarProducto("");
      // Llamar al callback para actualizar la lista de productos
      if (onProductCreated) {
        onProductCreated();
      }
      setTimeout(() => {
        setShowAlert(false);
      }, 2000);
    },
    onError: (error) => {
      setAlertMessage("Error al crear el producto. " + error.message);
      setTypeAlert("error");
      setShowAlert(true);
      setIsCreating(false);
    },
  });
  const producto: Producto | null = data?.buscarProductoSoftland || null;

  const handleBuscar = () => {
    if (codigoProducto.trim()) {
      setBuscarProducto(codigoProducto.trim());
    }
  };
  const handleCrearProducto = async () => {
    if (producto) {
      setIsCreating(true);
      try {
        await createProductoSoftland({
          variables: { createProductoCode: producto.codigo },
        });
      } catch (err) {
        console.error("Error al crear el producto:", err);
        setAlertMessage("Error al crear el producto.");
        setTypeAlert("error");
        setShowAlert(true);
        setIsCreating(false);
      }
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-8 max-h-[80vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-8 text-gray-300 hover:text-red-500 text-4xl font-bold"
        >
          ×
        </button>
        <h1 className="text-2xl font-bold text-center mb-4">
          Crear Producto de Softland
        </h1>
        {showAlert && alertMessage && (
          <Alert
            message={alertMessage}
            type={typeAlert}
            modal={true}
            onClose={() => setShowAlert(false)}
          />
        )}
        <div className="flex justify-between items-center mb-4 space-x-4">
          <div className="w-full">
            <input
              type="text"
              id="codigoProducto"
              placeholder="Ingresa el Código del Producto"
              value={codigoProducto}
              onChange={(e) => setCodigoProducto(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full"
              disabled={isCreating}
            />
          </div>
          <button
            className={`font-semibold px-4 py-2 rounded transition duration-200 ${
              !codigoProducto.trim() || isCreating
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            onClick={handleBuscar}
            disabled={!codigoProducto.trim() || isCreating}
          >
            Buscar
          </button>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-blue-500 text-lg">Buscando producto...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700 font-medium">
              Error al buscar el producto
            </p>
            <p className="text-red-600 text-sm">{error.message}</p>
          </div>
        )}
        {producto && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-300 pb-2">
              Información del Producto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <label className="text-sm font-medium text-gray-600 tracking-wide">
                  Código
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {producto.codigo}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <label className="text-sm font-medium text-gray-600 tracking-wide">
                  Nombre del Producto
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {producto.nombre_producto}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <label className="text-sm font-medium text-gray-600 tracking-wide">
                  Familia
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {producto.familia}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-100">
                <label className="text-sm font-medium text-gray-600 tracking-wide">
                  Unidad de Medida
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {producto.unidad_medida}
                </p>
              </div>
              <div className="bg-white p-4 rounded-md border border-gray-100 md:col-span-2">
                <label className="text-sm font-medium text-gray-600 tracking-wide">
                  Stock en Softland
                </label>
                <p className="text-2xl font-bold text-orange-500">
                  {producto.cantidad_softland}
                </p>
              </div>
            </div>
            <button
              className={`mt-6 w-full font-semibold px-4 py-2 rounded transition duration-200 ${
                isCreating
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-orange-400 text-white hover:bg-orange-500"
              }`}
              onClick={handleCrearProducto}
              disabled={isCreating}
            >
              {isCreating
                ? "Creando Producto..."
                : "Crear Producto en el Sistema"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default CrearProducto;
