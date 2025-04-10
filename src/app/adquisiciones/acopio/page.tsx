"use client";
import React, { useState, useEffect } from "react";
import NuevaOrdenAcopio from "@/components/adquisiciones/nuevaOrdenAcopio";

type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};

const AcopioPage: React.FC = () => {
  const [modalNuevaOrdenAcopio, setModalNuevaOrdenAcopio] = useState(false);
  const [ordenes, setOrdenes] = useState<OrdenAcopio[]>([]);

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
    <div className="p-10">
      <NuevaOrdenAcopio
        isOpen={modalNuevaOrdenAcopio}
        onClose={cerrarModalNuevaOrdenAcopio}
      />

      <div className="bg-white p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-semibold">Lista de Acopio</div>
          <button
            className="bg-amber-400 text-white font-semibold p-4 rounded hover:bg-amber-500 transition duration-300"
            onClick={abrirModalNuevaOrdenAcopio}
          >
            Nueva Orden de Acopio
          </button>
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 ">ID</th>
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
                  <div className="flex justify-center space-x-4">
                    <button className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-600 transition duration-300">
                      Editar
                    </button>
                    <button className="bg-amber-700 text-white font-semibold px-4 py-2 rounded hover:bg-amber-800 transition duration-300">
                      Eliminar
                    </button>
                    <button className="bg-amber-400 text-white font-semibold px-4 py-2 rounded hover:bg-amber-500 transition duration-300">
                      Confirmar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcopioPage;
