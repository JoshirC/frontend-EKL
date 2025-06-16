"use client";

import React from "react";
type Producto = {
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
  trazabilidad: boolean;
};
interface CambiarProductoProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto;
  codigoProductoSolicitado: string;
}

const CambiarProducto: React.FC<CambiarProductoProps> = ({
  isOpen,
  onClose,
  producto,
  codigoProductoSolicitado,
}) => {
  const handleClose = () => {
    onClose();
  };
  if (!isOpen) return null;
  const productos = [
    { codigo: "P001", nombre: "Yogur" },
    { codigo: "P002", nombre: "Agua Mineral" },
    { codigo: "P003", nombre: "Pollo" },
    { codigo: "P004", nombre: "Chips" },
    { codigo: "P005", nombre: "Pan" },
  ];
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Cambiar {producto.nombre_producto}
        </h1>
        <h2 className="text-sm mb-4 text-center">
          Busque el producto que desea cambiar por el solicitado
        </h2>
        {/* El backend debe enviar los productos disponibles para reemplazar */}
        <select
          className="w-full p-2 border border-gray-300 rounded"
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona una opción
          </option>
          {productos.map((producto) => (
            <option key={producto.codigo} value={producto.codigo}>
              {producto.codigo} - {producto.nombre}
            </option>
          ))}
        </select>
        <button className="bg-orange-400 hover:bg-orange-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200 mt-6">
          Cambiar
        </button>
        <button
          className="bg-gray-400 hover:bg-gray-500 w-full text-white font-semibold py-2 px-4 rounded transition duration-200 mt-4"
          onClick={handleClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CambiarProducto;
