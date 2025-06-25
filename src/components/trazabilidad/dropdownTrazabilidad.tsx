import React from "react";

type EnvioDetalle = {
  id: number;
  cantidad_enviada: number;
};

type EnviosDetalle = {
  envioDetalle: EnvioDetalle;
  centroCosto: string;
  fecha: string;
};
interface DropdownTrazabilidadProps {
  isOpen: boolean;
  onClose: () => void;
  enviosDetalle: EnviosDetalle[];
}
const DropdownTrazabilidad: React.FC<DropdownTrazabilidadProps> = ({
  isOpen,
  onClose,
  enviosDetalle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h2 className="text-base font-semibold sm:text-lg">
          Detalles de Envíos
        </h2>
        <button
          onClick={onClose}
          className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
        >
          Cerrar
        </button>
      </div>
      <div className="">
        {enviosDetalle.map((envio) => (
          <div
            key={envio.envioDetalle.id}
            className="flex sm:flex-row items-start sm:items-center p-3 sm:p-4 border rounded-lg mt-4  border-gray-200 hover:bg-gray-50"
          >
            <div className="flex flex-row sm:flex-col items-start gap-2 sm:gap-2 w-full">
              <p>
                <strong>Centro de Costo:</strong> {envio.centroCosto}
              </p>
              <p>
                <strong>Cantidad Enviada:</strong>{" "}
                {envio.envioDetalle.cantidad_enviada}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {new Date(envio.fecha).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DropdownTrazabilidad;
