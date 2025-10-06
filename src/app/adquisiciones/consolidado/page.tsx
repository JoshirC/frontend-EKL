"use client";
import React, { useEffect } from "react";
import ModalConsolidar from "@/components/adquisiciones/modalConsolidar";
import { useQuery } from "@apollo/client";
import { GET_RESUMEN_ORDEN_POR_TIPO } from "@/graphql/query";

type RespuestaResumen = {
  tipo: string;
  cantidad: number;
};
const ConsolidadoPage: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTipo, setModalTipo] = React.useState<
    "SS" | "CL" | "SM" | "SR ES"
  >("SM");
  const { loading, error, data, refetch } = useQuery(
    GET_RESUMEN_ORDEN_POR_TIPO
  );

  // Obtener cantidades por tipo
  const resumen: RespuestaResumen[] = data?.resumenTipoOrden || [];
  const getCantidad = (tipo: string) =>
    resumen.find((r) => r.tipo === tipo)?.cantidad ?? 0;

  useEffect(() => {
    if (data) {
      const resumen: RespuestaResumen[] = data.resumenTipoOrden;
    }
  }, [data]);
  const openModal = (tipo: "SS" | "CL" | "SM" | "SR ES") => {
    setModalTipo(tipo);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    refetch(); // Recargar la query al cerrar el modal
  };
  return (
    <div className="p-4 sm:p-10">
      <ModalConsolidar
        isOpen={modalOpen}
        onClose={closeModal}
        tipo={modalTipo}
      />
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Solicitudes de Abastecimiento (Pendientes de Compras)
          </div>
          <div className="space-x-2">
            <button
              className="bg-orange-400 text-white font-semibold p-2 sm:p-3 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={() => openModal("SS")}
            >
              Consolidar SS
            </button>
            <button
              className="bg-orange-400 text-white font-semibold p-2 sm:p-3 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={() => openModal("CL")}
            >
              Consolidar CL
            </button>
            <button
              className="bg-orange-400 text-white font-semibold p-2 sm:p-3 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={() => openModal("SR ES")}
            >
              Consolidar SR ES
            </button>
            <button
              className="bg-blue-500 text-white font-semibold p-2 sm:p-3 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
              onClick={() => openModal("SM")}
            >
              Ingresar SM
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Solicitud Mensual */}
          <div className="bg-gray-100 rounded shadow p-6 flex flex-col items-start">
            <h1 className="text-lg sm:text-xl font-semibold mb-2">
              Solicitud Mensual
            </h1>
            <h2 className="text-md sm:text-lg font-semibold mb-2">
              Número de solicitudes:
              <span className="ml-2 text-orange-500 font-bold">
                {getCantidad("SM")}
              </span>
            </h2>
            <button
              className="bg-orange-400 w-full text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-300"
              onClick={() =>
                (window.location.href = `/adquisiciones/consolidado/SM`)
              }
            >
              Ver detalles
            </button>
          </div>
          {/* Solicitudes SS */}
          <div className="bg-gray-100 rounded shadow p-6 flex flex-col items-start">
            <h1 className="text-lg sm:text-xl font-semibold mb-2">
              Solicitudes Semanales (Rectificación)
            </h1>
            <h2 className="text-md sm:text-lg font-semibold mb-2">
              Número de solicitudes:
              <span className="ml-2 text-orange-500 font-bold">
                {getCantidad("SS")}
              </span>
            </h2>
            <button
              className="bg-orange-400 w-full text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-300"
              onClick={() =>
                (window.location.href = `/adquisiciones/consolidado/SS`)
              }
            >
              Ver detalles
            </button>
          </div>
          {/* Solicitudes CL */}
          <div className="bg-gray-100 rounded shadow p-6 flex flex-col items-start">
            <h1 className="text-lg sm:text-xl font-semibold mb-2">
              Solicitudes Compras Locales
            </h1>
            <h2 className="text-md sm:text-lg font-semibold mb-2">
              Número de solicitudes:
              <span className="ml-2 text-orange-500 font-bold">
                {getCantidad("CL")}
              </span>
            </h2>
            <button
              className="bg-orange-400 w-full text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-300"
              onClick={() =>
                (window.location.href = `/adquisiciones/consolidado/CL`)
              }
            >
              Ver detalles
            </button>
          </div>
          {/* Solicitudes SR ES */}
          <div className="bg-gray-100 rounded shadow p-6 flex flex-col items-start">
            <h1 className="text-lg sm:text-xl font-semibold mb-2">
              Solicitudes Articulos de Escritorios
            </h1>
            <h2 className="text-md sm:text-lg font-semibold mb-2">
              Número de solicitudes:
              <span className="ml-2 text-orange-500 font-bold">
                {getCantidad("SR ES")}
              </span>
            </h2>
            <button
              className="bg-orange-400 text-white w-full font-semibold px-4 py-2 rounded hover:bg-orange-500 transition duration-300"
              onClick={() =>
                (window.location.href = `/adquisiciones/consolidado/SR ES`)
              }
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidadoPage;
