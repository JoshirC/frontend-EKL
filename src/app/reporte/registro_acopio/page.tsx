"use client";
import React, { useState, useEffect } from "react";
import { useAdquisicionStore } from "@/store/adquisicionStore";
type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};
const RegistroPage: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenAcopio[]>([]);
  const { setEstadoOrdenAcopio } = useAdquisicionStore();
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch("/api/ordenAcopio.json");
        const data = await response.json();
        // El backend debe traerme ya filtrado este dato.
        const ordenesPendientes = data.filter(
          (orden: OrdenAcopio) => orden.Estado === "Cerrado"
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
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Registro de Ordenes de Acopio
          </div>
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
                  Fecha
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
                        window.location.href = `/reporte/registro_acopio/${orden.idAcopio}`;
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

export default RegistroPage;
