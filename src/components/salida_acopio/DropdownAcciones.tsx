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
      <td colSpan={8} className="border-0 p-4">
        <div className="bg-white border border-gray-200 rounded shadow-lg py-4 px-8 m-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg">
              Selecciona el reemplazo para el producto: {codigoProducto} -{" "}
              {descripcion}
            </h2>
            <div className="flex items-center space-x-4">
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
            className="w-full border border-gray-300 rounded p-2 mt-4"
          />
          <div className="space-y-4 h-48 overflow-y-auto mt-4">
            {productos.map((producto) => (
              <div
                key={producto.codigoProducto}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex flex-col">
                  <h2>Código: {producto.codigoProducto}</h2>
                  <h2 className="text-gray-500">{producto.descripcion}</h2>
                </div>
                <div className="flex items-center space-x-4 w-1/3">
                  <input
                    type="number"
                    placeholder={`Cantidad en Bodega: ${String(
                      producto.stock
                    )}`}
                    className="w-full border border-gray-300 rounded p-2"
                    min="1"
                    max={producto.stock}
                  />
                  <button className="bg-blue-400 text-white font-semibold px-4 py-2 rounded hover:bg-blue-500">
                    Reemplazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default DropdownAcciones;
