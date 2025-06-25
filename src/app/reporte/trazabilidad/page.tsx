"use client";
import React, { useState } from "react";
import { GET_LISTA_TRAZABILIDAD } from "@/graphql/query";
import { useQuery } from "@apollo/client";
import DropdownTrazabilidad from "@/components/trazabilidad/dropdownTrazabilidad";
type Producto = {
  id: number;
  codigo: string;
  nombre_producto: string;
};

type Usuario = {
  id: number;
  nombre: string;
  rut: string;
};

type Trazabilidad = {
  id: number;
  numero_lote: string;
  cantidad_producto: number;
  fecha_elaboracion: string;
  fecha_vencimiento: string;
  temperatura: string;
  observaciones: string;
  codigo_proveedor: string;
  numero_factura: number;
  producto: Producto;
  usuario: Usuario;
};

type EnvioDetalle = {
  id: number;
  cantidad_enviada: number;
};

type EnviosDetalle = {
  envioDetalle: EnvioDetalle;
  centroCosto: string;
  fecha: string;
};

type TrazabilidadConEnvios = {
  trazabilidad: Trazabilidad;
  enviosDetalle: EnviosDetalle[];
};

const TrazabilidadPage: React.FC = () => {
  const { loading, error, data } = useQuery(GET_LISTA_TRAZABILIDAD);
  const [isDropdownOpen, setIsDropdownOpen] = useState<number | null>(null);

  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando trazabilidad...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>{error.message}</p>
        </div>
      </div>
    );
  <div className="p-10">
    <div className="bg-white p-6 rounded shadow">
      <p>No hay datos de trazabilidad disponibles.</p>
    </div>
  </div>;
  if (
    !data ||
    !data.trazabilidadesConEnvios ||
    data.trazabilidadesConEnvios.length === 0
  )
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>No hay datos de trazabilidad disponibles.</p>
        </div>
      </div>
    );
  const trazabilidadList: TrazabilidadConEnvios[] =
    data.trazabilidadesConEnvios;
  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-6 rounded shadow">
        {/* Titulo */}
        <h1 className="text-2xl font-bold mb-4">Trazabilidad</h1>
        {/* Tabla Contenidos */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Lote
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Elaboración
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Vencimiento
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Temperatura
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Observaciones
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Proveedor
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Número Factura
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Usuario
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Envios
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trazabilidadList.map((item) => {
                // Convertir fechas a objetos Date
                const fechaVencimiento = new Date(
                  item.trazabilidad.fecha_vencimiento
                );
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                // Calcular fecha dentro de 3 meses
                const tresMesesDespues = new Date(hoy);
                tresMesesDespues.setMonth(tresMesesDespues.getMonth() + 3);

                // Determinar clase de color
                let rowClass = "";
                if (fechaVencimiento < hoy) {
                  rowClass = "bg-red-200";
                } else if (fechaVencimiento < tresMesesDespues) {
                  rowClass = "bg-green-200";
                }

                return (
                  <React.Fragment key={item.trazabilidad.id}>
                    <tr className={rowClass}>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.id}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.producto.nombre_producto}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.cantidad_producto}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.numero_lote}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.fecha_elaboracion}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.fecha_vencimiento}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.temperatura}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.observaciones}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.codigo_proveedor}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.numero_factura}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.trazabilidad.usuario.nombre}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {item.enviosDetalle.length > 0 ? (
                          <button
                            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded transition duration-200 w-full"
                            onClick={() =>
                              setIsDropdownOpen(item.trazabilidad.id)
                            }
                          >
                            Detalles
                          </button>
                        ) : (
                          <p>Sin Registro</p>
                        )}
                      </td>
                    </tr>
                    {isDropdownOpen === item.trazabilidad.id && (
                      <tr>
                        <td
                          colSpan={12}
                          className="border-0 p-2 sm:p-4 bg-gray-100"
                        >
                          <DropdownTrazabilidad
                            isOpen={isDropdownOpen === item.trazabilidad.id}
                            onClose={() => setIsDropdownOpen(null)}
                            enviosDetalle={item.enviosDetalle}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrazabilidadPage;
