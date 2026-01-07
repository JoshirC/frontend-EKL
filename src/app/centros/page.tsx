"use client";

import React, { useEffect, useState } from "react";
import { GET_CENTROS_COSTOS_UNICOS } from "@/graphql/query";
import { useQuery, useMutation } from "@apollo/client";
import { CentroCosto } from "@/types/graphql";
import { UPDATE_STATUS_CENTRO } from "@/graphql/mutations";
import NuevoCentro from "@/components/centros/nuevoCentro";
import EditarCentro from "@/components/centros/editarCentro";
import Alert from "@/components/Alert";
const CentroPage: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_CENTROS_COSTOS_UNICOS);
  const [showNuevoCentro, setShowNuevoCentro] = useState(false);
  const [showEditarCentro, setShowEditarCentro] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [centroEdit, setCentroEdit] = useState<CentroCosto | null>(null);

  const centrosCostos: CentroCosto[] = data ? data.centrosCosto : [];
  const [updateStatusCentroCosto] = useMutation(UPDATE_STATUS_CENTRO);
  const handleActualizarEstadoCentro = async (
    updateActivoCentroCostoId: number
  ) => {
    try {
      await updateStatusCentroCosto({
        variables: {
          updateActivoCentroCostoId,
        },
      });
      setAlertMessage("Estado Actualizado con exíto");
      setAlertType("exitoso");
      setShowAlert(true);
      refetch();
    } catch (error) {
      setAlertMessage(
        error instanceof Error ? error.message : "Error al actualizar el estado"
      );
      setAlertType("error");
      setShowAlert(true);
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando centros de costos...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Error al cargar los centros de costos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      {showNuevoCentro && (
        <NuevoCentro
          isOpen={showNuevoCentro}
          onClose={() => setShowNuevoCentro(false)}
          onSuccess={refetch}
        />
      )}
      {showEditarCentro && centroEdit != null && (
        <EditarCentro
          isOpen={showEditarCentro}
          onClose={() => setShowEditarCentro(false)}
          onSuccess={refetch}
          centro={centroEdit}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {/* Cabecera */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-semibold">
            Gestión de Centros de Costos
          </h1>
          <button
            className="bg-orange-400 text-white font-semibold px-3 py-4 rounded hover:bg-orange-500 transition duration-300"
            onClick={() => setShowNuevoCentro(true)}
          >
            Crear Nuevo Centro
          </button>
        </div>
        {/* Tabla Contenido */}
        <div className="overflow-x-auto mt-2">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Nombre
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
              {centrosCostos.map((centro) => (
                <tr key={centro.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {centro.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {centro.codigo}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {centro.nombre}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {centro.activo ? "Activo" : "Inactivo"}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <div className="flex flex-col sm:flex-row lg:space-x-2 lg:w-full gap-2">
                      <button className="bg-orange-400 hover:bg-orange-500 text-white font-semibold w-full px-3 py-2 rounded">
                        Ver Usuarios
                      </button>
                      <button
                        onClick={() => {
                          setCentroEdit(centro);
                          setShowEditarCentro(true);
                        }}
                        className="bg-blue-400 text-white font-semibold w-full px-3 py-2 rounded hover:bg-blue-500 transition duration-300"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleActualizarEstadoCentro(centro.id)}
                        className={` text-white font-semibold w-full px-3 py-2 rounded ${
                          centro.activo
                            ? "bg-red-500 hover:bg-red-600"
                            : "bg-gray-400 hover:bg-gray-500"
                        }
                        `}
                      >
                        {centro.activo ? "Desactivar" : "Activar"}
                      </button>
                    </div>
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

export default CentroPage;
