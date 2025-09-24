"use client";
import React from "react";
import ModalConsolidar from "@/components/adquisiciones/modalConsolidar";

const ConsolidadoPage: React.FC = () => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTipo, setModalTipo] = React.useState<
    "SS" | "CL" | "SM" | "SR ES"
  >("SM");
  const openModal = (tipo: "SS" | "CL" | "SM" | "SR ES") => {
    setModalTipo(tipo);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
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
            Solicitudes de Abastecimiento
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
        <hr className="border-t border-gray-300" />
        <h1 className="text-lg sm:text-xl font-semibold mt-4 mb-2">
          Solicitud Mensual
        </h1>
        <div>
          Aquí va el contenido relacionado con las solicitudes mensuales.
        </div>
        <hr className="border-t mt-2 border-gray-300" />
        <h1 className="text-lg sm:text-xl font-semibold mt-4 mb-2">
          Consolidado SS
        </h1>
        <div>
          Aquí va el contenido relacionado con las solicitudes de esta semana.
        </div>
        <hr className="border-t mt-2 border-gray-300" />
        <h1 className="text-lg sm:text-xl font-semibold mt-4 mb-2">
          Consolidado CL
        </h1>
        <div>
          Aquí va el contenido relacionado con las solicitudes de esta semana.
        </div>
        <hr className="border-t mt-2 border-gray-300" />
        <h1 className="text-lg sm:text-xl font-semibold mt-4 mb-2">
          Consolidado SR_ES
        </h1>
        <div>
          Aquí va el contenido relacionado con las solicitudes de esta semana.
        </div>
      </div>
    </div>
  );
};

export default ConsolidadoPage;
