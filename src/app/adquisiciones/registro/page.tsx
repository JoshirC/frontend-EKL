"use client";
import React, { useState, useEffect } from "react";

type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};
const RegistroPage: React.FC = () => {
  const [ordenes, setOrdenes] = useState<OrdenAcopio[]>([]);
  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch("/api/ordenAcopio.json");
        const data = await response.json();
        // El backend debe traerme ya filtrado este dato.
        const ordenesPendientes = data.filter(
          (orden: OrdenAcopio) => orden.Estado === "Terminado"
        );
        setOrdenes(ordenesPendientes);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };

    fetchOrdenes();
  }, []);
  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-semibold">
            Registro de Ordenes de Compras
          </div>
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Centro Costo</th>
              <th className="border border-gray-300 px-4 py-2">
                Fecha Ingreso
              </th>
              <th className="border border-gray-300 px-4 py-2">Estado</th>
              <th className="border border-gray-300 px-4 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.map((orden) => (
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
                  <button className="bg-amber-400 text-white font-semibold px-4 py-2 w-full rounded hover:bg-amber-500 transition duration-300">
                    Detalles
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

export default RegistroPage;
