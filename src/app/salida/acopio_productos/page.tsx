"use client";
import React, { useEffect, useState } from "react";

type CentroCosto = {
  Centro: string;
  Pendiente: number;
  Proceso: number;
};

const AcopioProductosPage: React.FC = () => {
  const [centrosDeCostos, setCentrosDeCostos] = useState<CentroCosto[]>([]);
  useEffect(() => {
    const fetchCentrosDeCostos = async () => {
      try {
        const response = await fetch("/api/centroCosto.json");
        const data = await response.json();
        setCentrosDeCostos(data);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };
    fetchCentrosDeCostos();
  }, []);
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
                key={centro.Centro}
                className="bg-gray-100 text-black text-lg sm:text-xl p-4 rounded shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4"
              >
                <div className="font-semibold">{centro.Centro}</div>
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
                      window.location.href = `/salida/acopio_productos/${centro.Centro}`;
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
