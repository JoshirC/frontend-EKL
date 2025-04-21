"use client";
import React, { useEffect, useState } from "react";

interface DropdownCargaSoftlandProps {
  idAcopio: number;
  isOpen: boolean;
  onClose: () => void;
}

type SalidaAcopio = {
  idSalida: number;
  idOrdenAcopio: number;
  fechaSalida: string;
};

const DropdownCargaSoftland: React.FC<DropdownCargaSoftlandProps> = ({
  idAcopio,
  isOpen,
  onClose,
}) => {
  const [salidaAcopio, setSalidaAcopio] = useState<SalidaAcopio[]>([]);
  if (!isOpen) return null;

  useEffect(() => {
    const fetchSalidaAcopio = async () => {
      const response = await fetch("/api/salidaAcopio.json");
      const data = await response.json();
      const salidaAcopioFiltrado = data.filter(
        (salida: SalidaAcopio) => salida.idOrdenAcopio === idAcopio
      );
      setSalidaAcopio(salidaAcopioFiltrado);
    };
    fetchSalidaAcopio();
  }, []);

  return (
    <tr>
      <td colSpan={4} className="border-0 p-2 sm:p-4">
        <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
            <h2 className="text-base sm:text-lg">
              Listado de Guias de Salida para la Orden de Acopio N°{idAcopio}
            </h2>

            <button
              className="hidden sm:block bg-gray-500 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-gray-600 transition duration-200"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>

          {salidaAcopio.map((salida) => (
            <div
              key={salida.idSalida}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mt-2 gap-2 sm:gap-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                <h2 className="text-sm sm:text-base">
                  Guia de Salida N°{salida.idSalida}
                </h2>
                <h2 className="text-gray-500 text-sm sm:text-base">
                  Fecha de Salida: {salida.fechaSalida}
                </h2>
              </div>
              <button
                className="bg-blue-400 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-blue-500 w-full sm:w-auto"
                onClick={() => {
                  window.location.href = `/salida/carga_softland/${salida.idSalida}`;
                  onClose();
                }}
              >
                ▶
              </button>
            </div>
          ))}

          <button
            className="sm:hidden bg-gray-500 text-white w-full font-semibold p-2 mt-4 rounded hover:bg-gray-600 transition duration-200"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </td>
    </tr>
  );
};

export default DropdownCargaSoftland;
