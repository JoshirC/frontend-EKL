"use client";
import React, { useState, useEffect } from "react";
import NuevaOrdenAcopio from "@/components/adquisiciones/nuevaOrdenAcopio";
import { useAdquisicionStore } from "@/store/adquisicionStore";

type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};

const AcopioPage: React.FC = () => {
  const [modalNuevaOrdenAcopio, setModalNuevaOrdenAcopio] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenAcopio[]>([]);

  const { estadoOrdenAcopio, setEstadoOrdenAcopio } = useAdquisicionStore();
  const abrirModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(true);
  };

  const cerrarModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(false);
  };

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch("/api/ordenAcopio.json");
        const data = await response.json();
        // El backend debe traerme ya filtrado este dato.
        const ordenesPendientes = data.filter(
          (orden: OrdenAcopio) => orden.Estado === "Pendiente"
        );
        setOrdenes(ordenesPendientes);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };

    fetchOrdenes();
  }, []);

  return (
    <div className="p-4 sm:p-10">
      <NuevaOrdenAcopio
        isOpen={modalNuevaOrdenAcopio}
        onClose={cerrarModalNuevaOrdenAcopio}
      />

      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Lista de Acopio
          </div>
          <button
            className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
            onClick={abrirModalNuevaOrdenAcopio}
          >
            Nueva Orden de Acopio
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Centro Costo
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Ingreso
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Estado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr key={orden.idAcopio}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.idAcopio}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.CentroCosto}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.Fecha}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.Estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button
                      className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 w-full rounded hover:bg-orange-500 transition duration-300"
                      onClick={() => {
                        window.location.href = `/adquisiciones/${orden.idAcopio}`;
                        setEstadoOrdenAcopio(orden.Estado);
                      }}
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcopioPage;
