"use client";

import React, { useEffect, useState, use } from "react";
import { useSalidaStore } from "@/store/salidaStore";
type OrdenAcopio = {
  idAcopio: number;
  CentroCosto: string;
  Fecha: string;
  Estado: string;
};

export default function CentroCostoNamePage({
  params,
}: {
  params: Promise<{ centro_costo: string }>;
}) {
  const { centro_costo } = use(params);
  const [ordenes, setOrdenes] = useState<OrdenAcopio[]>([]);
  const { setCentroCosto, setFecha, setEstado } = useSalidaStore();

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const response = await fetch("/api/ordenAcopio.json");
        const data = await response.json();
        // El backend debe traerme ya filtrado este dato.
        const ordenesCentroCosto = data.filter(
          (orden: OrdenAcopio) =>
            orden.CentroCosto === centro_costo &&
            (orden.Estado === "Pendiente" || orden.Estado === "Proceso")
        );
        setOrdenes(ordenesCentroCosto);
      } catch (error) {
        console.error("Error al cargar el JSON:", error);
      }
    };
    fetchOrdenes();
  }, [centro_costo]);
  return (
    <div className="p-10">
      <div className="bg-white p-6 rounded shadow">
        <div className="text-2xl font-semibold">
          Lista de Acopio {centro_costo}{" "}
        </div>
        <table className="table-fixed w-full border-collapse border border-gray-200 mt-2">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2">ID</th>
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
                  {orden.Fecha}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {orden.Estado}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {orden.Estado === "Pendiente" ? (
                    <button
                      className="bg-orange-400 text-white w-full font-semibold p-4 rounded hover:bg-orange-500 transition duration-300"
                      onClick={() => {
                        window.location.href = `/salida/${orden.idAcopio}`;
                        setCentroCosto(orden.CentroCosto);
                        setFecha(orden.Fecha);
                        setEstado(orden.Estado);
                      }}
                    >
                      Comenzar Acopio
                    </button>
                  ) : (
                    <button
                      className="bg-blue-400 text-white w-full font-semibold p-4 rounded hover:bg-blue-500 transition duration-300"
                      onClick={() => {
                        window.location.href = `/salida/${orden.idAcopio}`;
                        setCentroCosto(orden.CentroCosto);
                        setFecha(orden.Fecha);
                        setEstado(orden.Estado);
                      }}
                    >
                      Continuar Acopio
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
