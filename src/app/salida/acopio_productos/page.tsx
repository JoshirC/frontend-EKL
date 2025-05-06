"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_CENTROS_COSTOS } from "@/graphql/query";

type CentroCosto = {
  centroCosto: string;
  Pendiente: number;
  Proceso: number;
};

const AcopioProductosPage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CENTROS_COSTOS);
  const [centrosDeCostos, setCentrosDeCostos] = useState<CentroCosto[]>([]);

  useEffect(() => {
    if (data) {
      setCentrosDeCostos(data.ordenAcopioDosEstados);
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
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">
            Error al cargar los datos: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Centros de Costos
          </div>
        </div>
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {centrosDeCostos.map((centro) => (
              <div
                key={centro.centroCosto}
                className="bg-gray-100 text-black text-lg sm:text-xl p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4"
              >
                <div className="font-semibold">{centro.centroCosto}</div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                  <div>
                    <span className="font-semibold">Pendiente:</span>{" "}
                    {centro.Pendiente}
                  </div>
                  <div>
                    <span className="font-semibold">Proceso:</span>{" "}
                    {centro.Proceso}
                  </div>
                  <button
                    className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 rounded shadow hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
                    onClick={() => {
                      window.location.href = `/salida/acopio_productos/${centro.centroCosto}`;
                    }}
                  >
                    Ingresar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcopioProductosPage;
