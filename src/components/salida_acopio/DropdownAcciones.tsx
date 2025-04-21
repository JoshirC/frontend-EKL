import React from "react";

interface DropdownAccionesProps {
  codigoProducto: string;
  descripcion: string;
  isOpen: boolean;
  onClose: () => void;
}

const DropdownAcciones: React.FC<DropdownAccionesProps> = ({
  codigoProducto,
  descripcion,
  isOpen,
  onClose,
}) => {
  const productos = [
    {
      codigoProducto: "P001",
      descripcion: "Jamon de puerco",
      stock: 10,
    },
    {
      codigoProducto: "P002",
      descripcion: "Jamon de pollo",
      stock: 10,
    },
    {
      codigoProducto: "P003",
      descripcion: "Jamon de pavo",
      stock: 10,
    },
    {
      codigoProducto: "P004",
      descripcion: "Jamon de pollo",
      stock: 10,
    },
  ];
  if (!isOpen) return null;

  return (
    <tr>
      <td colSpan={8} className="border-0 p-2 sm:p-4">
        <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg">
              Selecciona el reemplazo para el producto: {codigoProducto} -{" "}
              {descripcion}
            </h2>
            <div className="hidden sm:flex items-center gap-4">
              <button className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-200">
                Buscar otro producto
              </button>
              <button
                className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
          <input
            type="text"
            placeholder="Buscar producto"
            className="w-full border border-gray-300 rounded p-2 mt-4 text-sm sm:text-base"
          />

          {productos.map((producto) => (
            <div
              key={producto.codigoProducto}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mt-2 gap-2 sm:gap-4"
            >
              <div className="flex flex-col gap-1 sm:gap-2">
                <h2 className="text-sm sm:text-base">
                  Código: {producto.codigoProducto}
                </h2>
                <h2 className="text-gray-500 text-sm sm:text-base">
                  {producto.descripcion}
                </h2>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-1/3">
                <input
                  type="number"
                  placeholder={`Cantidad en Bodega: ${String(producto.stock)}`}
                  className="w-full border border-gray-300 rounded p-2 text-sm sm:text-base"
                  min="1"
                  max={producto.stock}
                />
                <button className="bg-blue-400 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-blue-500 w-full sm:w-auto">
                  Reemplazar
                </button>
              </div>
            </div>
          ))}

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
      </td>
    </tr>
  );
};

export default DropdownAcciones;
