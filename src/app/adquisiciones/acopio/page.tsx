"use client";
import React, { useState } from "react";
import NuevaOrdenAcopio from "@/components/adquisiciones/nuevaOrdenAcopio";
const AcopioPage: React.FC = () => {
  const [modalNuevaOrdenAcopio, setModalNuevaOrdenAcopio] = useState(false);
  const abrirModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(!modalNuevaOrdenAcopio);
  };
  const cerrarModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(!modalNuevaOrdenAcopio);
  };
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
            onClick={() => {
              abrirModalNuevaOrdenAcopio();
            }}
          >
            Nueva Orden de Acopio
          </button>
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 p-2 text-left">ID</th>
              <th className="border border-gray-300 p-2 text-left">
                Centro Costo
              </th>
              <th className="border border-gray-300 p-2 text-left">
                Fecha Ingreso
              </th>
              <th className="border border-gray-300 p-2 text-left">Estado</th>
              <th className="border border-gray-300 p-2 text-left">Acciones</th>
            </tr>
          </thead>
          {/* Hacer un Map de las listas con estado Pendiente */}
          <tbody>
            <tr className="hover:bg-gray-100">
              <td className="border border-gray-300 p-2">1</td>
              <td className="border border-gray-300 p-2">Centro 1</td>
              <td className="border border-gray-300 p-2">2023-10-01</td>
              <td className="border border-gray-300 p-2">Pendiente</td>
              <td className="p-2 flex justify-center">
                <button className="bg-amber-400 text-white font-semibold px-4 py-2 rounded hover:bg-amber-500 transition duration-300">
                  Editar
                </button>
                <button className="bg-red-500 text-white font-semibold px-4 py-2 rounded hover:bg-red-600 transition duration-300 ml-2">
                  Eliminar
                </button>
                <button className="bg-blue-500 text-white font-semibold px-4 py-2 rounded hover:bg-blue-600 transition duration-300 ml-2">
                  Confirmar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcopioPage;
