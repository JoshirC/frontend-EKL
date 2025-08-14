"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  GET_CENTROS_COSTOS,
  GET_ORDENES_ACOPIO_MULTIPLES_ESTADOS,
} from "@/graphql/query";
import Alert from "@/components/Alert";
import ListaVacia from "@/components/listaVacia";

type CentroCosto = {
  centroCosto: string;
  Subir: number;
  Parcial: number;
};

const CargaSoftlandPage: React.FC = () => {
  // Ejemplo de uso con todos los estados
  const { loading, error, data } = useQuery(GET_CENTROS_COSTOS, {
    variables: {
      estados: ["Parcial", "Subir"],
    },
  });

  const [centrosDeCostos, setCentrosDeCostos] = useState<CentroCosto[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (data) {
      setCentrosDeCostos(data.ordenAcopioMultiplesEstados);
    }
  }, [data]);

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
    setAlertType("error");
    setAlertMessage(error.message);
    setShowAlert(true);
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
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl sm:text-2xl font-bold">Centros de Costos</div>
        </div>
        <div>
          {centrosDeCostos.length === 0 && (
            <div className="p-4 rounded bg-gray-100">
              <ListaVacia mensaje="No hay ordenes de Acopio disponibles." />
            </div>
          )}
          <div className="grid grid-cols-1 gap-6">
            {centrosDeCostos.map((centro) => (
              <div
                key={centro.centroCosto}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Header con el nombre del centro de costo */}
                <div className="bg-gray-200 px-6 py-4 border-b border-gray-200 rounded-t-lg">
                  <h3 className="text-xl font-bold text-gray-800">
                    {centro.centroCosto}
                  </h3>
                </div>

                {/* Contenido principal */}
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    {/* Grid de estados y cantidades */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                          Subir
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {centro.Subir}
                        </div>
                      </div>

                      <div className="bg-gray-100 rounded-lg p-4 text-center">
                        <div className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-1">
                          Parcial
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {centro.Parcial}
                        </div>
                      </div>
                    </div>

                    {/* Botón de acción */}
                    <div className="w-full lg:w-auto">
                      <button
                        className="bg-orange-400 text-white font-semibold px-6 py-3 rounded shadow-md hover:bg-orange-500 transition-all duration-300 hover:shadow-lg w-full lg:w-auto"
                        onClick={() => {
                          window.location.href = `/salida/carga_softland/${centro.centroCosto}`;
                        }}
                      >
                        Ingresar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CargaSoftlandPage;
