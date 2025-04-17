"use client";
import React, { useState, useEffect } from "react";
import DropdownCargaSoftland from "@/components/salida_acopio/dropdownCargaSoftland";

type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};

const CargaSoftlandPage: React.FC = () => {
  const [ordenAcopio, setOrdenAcopio] = useState<OrdenAcopio[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrdenAcopio = async () => {
      const response = await fetch("/api/ordenAcopio.json");
      const data = await response.json();
      const ordenAcopioFiltrado = data.filter(
        (orden: OrdenAcopio) => orden.Estado === "Subir"
      );
      setOrdenAcopio(ordenAcopioFiltrado);
    };
    fetchOrdenAcopio();
  }, []);

  const handleDropdownClick = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="text-xl sm:text-2xl font-semibold mb-4">
          Listas de Acopio para cargar a Softland
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Centro de Costo
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
              {ordenAcopio.map((orden) => (
                <React.Fragment key={orden.idAcopio}>
                  <tr>
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
                        className="bg-orange-400 text-white font-semibold p-3 sm:p-4 w-full rounded hover:bg-orange-500 transition duration-300"
                        onClick={() => handleDropdownClick(orden.idAcopio)}
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                  {dropdownOpen === orden.idAcopio && (
                    <DropdownCargaSoftland
                      idAcopio={orden.idAcopio}
                      isOpen={true}
                      onClose={() => setDropdownOpen(null)}
                    />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CargaSoftlandPage;
