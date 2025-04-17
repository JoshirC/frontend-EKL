"use client";
import React, { useState, useEffect } from "react";
import { useSalidaStore } from "@/store/salidaStore";
type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};

const RevisionPage: React.FC = () => {
  const [ordenAcopio, setOrdenAcopio] = useState<OrdenAcopio[]>([]);
  const { setCentroCosto, setFecha, setEstado } = useSalidaStore();
  useEffect(() => {
    const fetchOrdenAcopio = async () => {
      const response = await fetch("/api/ordenAcopio.json");
      const data = await response.json();
      const dataFiltrada = data.filter(
        (orden: OrdenAcopio) => orden.Estado === "Confirmacion"
      );
      setOrdenAcopio(dataFiltrada);
    };
    fetchOrdenAcopio();
  }, []);
  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="text-2xl font-semibold">
          Revision de Acopio de Productos
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">
                Centro de Costo
              </th>
              <th className="border border-gray-300 px-4 py-2">Fecha</th>
              <th className="border border-gray-300 px-4 py-2">Estado</th>
              <th className="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenAcopio.map((orden) => (
              <tr key={orden.idAcopio}>
                <td className="border border-gray-300 px-4 py-2">
                  {orden.idAcopio}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {orden.CentroCosto}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {orden.Fecha}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {orden.Estado}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    className="bg-orange-400 hover:bg-orange-500 w-full text-white font-semibold py-2 px-4 rounded"
                    onClick={() => {
                      window.location.href = `/salida/${orden.idAcopio}`;
                      setEstado(orden.Estado);
                      setCentroCosto(orden.CentroCosto);
                      setFecha(orden.Fecha);
                    }}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevisionPage;
