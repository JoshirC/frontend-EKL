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
      <td colSpan={4} className="border-0 p-4">
        <div className="bg-white border border-gray-200 rounded shadow-lg py-4 px-8 m-1">
          <div className="flex justify-between items-center">
            <h2 className="text-lg">
              Listado de Guias de Salida para la Orden de Acopio N°{idAcopio}
            </h2>

            <button
              className="bg-gray-500 text-white w-1/12 font-semibold px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
              onClick={onClose}
            >
              Cerrar
            </button>
          </div>
          <div className="mt-4">
            {salidaAcopio.map((salida) => (
              <div
                key={salida.idSalida}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mt-2"
              >
                <h2>Guia de Salida N°{salida.idSalida}</h2>
                <h2 className="text-gray-500">
                  Fecha de Salida: {salida.fechaSalida}
                </h2>
                <button
                  className="bg-blue-400 text-white font-semibold px-4 py-2 rounded hover:bg-blue-500"
                  onClick={() => {
                    window.location.href = `/salida/carga_softland/${salida.idSalida}`;
                    onClose();
                  }}
                >
                  ▶
                </button>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
};

export default DropdownCargaSoftland;
