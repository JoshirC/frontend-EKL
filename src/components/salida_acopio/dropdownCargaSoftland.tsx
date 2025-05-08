"use client";
import React from "react";
import { useQuery } from "@apollo/client";
import { GET_GUIAS_DE_SALIDA_POR_ORDEN_ACOPIO } from "@/graphql/query";
interface DropdownCargaSoftlandProps {
  idAcopio: number;
  isOpen: boolean;
  onClose: () => void;
}

type SalidaAcopio = {
  id: number;
  fechaCreacion: number;
  codigo: string;
};

const DropdownCargaSoftland: React.FC<DropdownCargaSoftlandProps> = ({
  idAcopio,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const { loading, error, data } = useQuery(
    GET_GUIAS_DE_SALIDA_POR_ORDEN_ACOPIO,
    {
      variables: { ordenAcopioId: idAcopio },
    }
  );
  const salidaAcopio: SalidaAcopio[] = data?.guiasDeSalidaPorOrdenAcopio || [];
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando detalles del acopio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">
            Error al cargar los datos: {error.message}
          </p>
        </div>
      </div>
    );
  }
  return (
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
          key={salida.id}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 mt-2 gap-2 sm:gap-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <h2 className="text-sm sm:text-base">
              Guia de Salida N°{salida.id}
            </h2>
          </div>
          <button
            className="bg-blue-400 text-white font-semibold p-2 sm:px-4 sm:py-2 rounded hover:bg-blue-500 w-full sm:w-auto"
            onClick={() => {
              window.location.href = `/salida/carga_softland/${salida.id}`;
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
  );
};

export default DropdownCargaSoftland;
