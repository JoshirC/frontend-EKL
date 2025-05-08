"use client";
import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDENES_ACOPIO } from "@/graphql/query";
import DropdownCargaSoftland from "@/components/salida_acopio/dropdownCargaSoftland";
import Alert from "@/components/Alert";

type OrdenAcopio = {
  id: number;
  centroCosto: string;
  fecha: string;
  estado: string;
};

const CargaSoftlandPage: React.FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { loading, error, data, refetch } = useQuery(GET_ORDENES_ACOPIO, {
    variables: { estado: "Subir" },
  });
  const handleDropdownClick = (id: number) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando ordenes de acopio...</p>
        </div>
      </div>
    );
  }
  if (error) {
    setAlertType("error");
    setAlertMessage(error.message);
    setShowAlert(true);
  }
  const ordenesAcopio: OrdenAcopio[] = data.ordenAcopiosByEstado;
  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
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
              {ordenesAcopio.map((orden) => (
                <React.Fragment key={orden.id}>
                  <tr>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {orden.centroCosto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {orden.fecha}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {orden.estado}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <button
                        className="bg-orange-400 text-white font-semibold p-3 sm:p-4 w-full rounded hover:bg-orange-500 transition duration-300"
                        onClick={() => handleDropdownClick(orden.id)}
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                  {dropdownOpen === orden.id && (
                    <tr>
                      <td colSpan={4} className="border-0 p-2 sm:p-4">
                        <DropdownCargaSoftland
                          idAcopio={orden.id}
                          isOpen={true}
                          onClose={() => setDropdownOpen(null)}
                        />
                      </td>
                    </tr>
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
