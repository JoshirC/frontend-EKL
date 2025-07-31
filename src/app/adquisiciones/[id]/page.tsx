"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import FamilyPagination from "@/components/FamilyPagination";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import {
  UPDATE_ESTADO_ORDEN_ACOPIO,
  ELIMINAR_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import Confirmacion from "@/components/confirmacion";
type Producto = {
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
};
type DetalleOrdenAcopio = {
  id: number;
  codigo_producto: string;
  cantidad: number;
  producto: Producto;
};

export default function AcopioIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = React.use(params);
  const id_acopio_num = parseInt(id_acopio);

  // Estado de la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  // Estado de la confirmacion
  const [showConfirmacion, setShowConfirmacion] = useState(false);

  // Estados para filtros
  const [currentFamily, setCurrentFamily] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredDetalles, setFilteredDetalles] = useState<
    DetalleOrdenAcopio[]
  >([]);

  const { loading, error, data } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });

  // Efecto para filtrar los detalles
  useEffect(() => {
    if (data?.ordenAcopio?.detalles) {
      const filtered = data.ordenAcopio.detalles.filter(
        (detalle: DetalleOrdenAcopio) => {
          const matchesSearch =
            detalle.codigo_producto
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            detalle.producto.nombre_producto
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          const matchesFamily =
            !currentFamily || detalle.producto.familia === currentFamily;

          return matchesSearch && matchesFamily;
        }
      );

      setFilteredDetalles(filtered);
    }
  }, [data, searchTerm, currentFamily]);
  const [eliminarOrdenAcopio] = useMutation(ELIMINAR_ORDEN_ACOPIO, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("La orden de acopio se ha eliminado correctamente");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/adquisiciones/acopio/";
      }, 2000);
    },
    onError: (mutationError) => {
      setAlertType("error");
      setAlertMessage(mutationError.message);
      setShowAlert(true);
    },
  });
  const [updateEstadoOrdenAcopio] = useMutation(UPDATE_ESTADO_ORDEN_ACOPIO, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("La orden de acopio se ha confirmado correctamente");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/adquisiciones/acopio/";
      }, 2000);
    },
    onError: (mutationError) => {
      setAlertType("error");
      setAlertMessage(mutationError.message);
      setShowAlert(true);
    },
  });
  const handleConfirmarAcopio = () => {
    updateEstadoOrdenAcopio({
      variables: {
        id: id_acopio_num,
        estado: "Pendiente",
      },
    });
  };
  const handleEliminarOrdenAcopio = () => {
    try {
      eliminarOrdenAcopio({
        variables: {
          id: id_acopio_num,
        },
      });
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al eliminar la orden de acopio");
      setShowAlert(true);
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado) {
      handleEliminarOrdenAcopio();
    }
    setShowConfirmacion(false);
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando detalles del acopio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Error al cargar los detalles del acopio: {error.message}</p>
        </div>
      </div>
    );
  }

  if (!data?.ordenAcopio?.detalles) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>No se encontraron datos del acopio</p>
        </div>
      </div>
    );
  }

  const { detalles } = data.ordenAcopio;

  // Extraer familias únicas de los detalles
  const familyGroups: string[] =
    detalles.length > 0
      ? (
          Array.from(
            new Set(
              detalles
                .map((detalle: DetalleOrdenAcopio) => detalle.producto?.familia)
                .filter(Boolean)
            )
          ) as string[]
        ).sort()
      : [];

  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Eliminar Orden de Acopio"
          mensaje={`¿Estás seguro de que deseas eliminar la orden de Acopio?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalles de Acopio N°{id_acopio}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={handleConfirmarAcopio}
            >
              Confirmar Acopio
            </button>
            <button
              className="bg-red-500 text-white font-semibold p-3 sm:p-4 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                setShowConfirmacion(true);
              }}
            >
              Cancelar Acopio
            </button>
          </div>
        </div>

        {/* Controles de filtro */}
        {detalles.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row justify-start items-center mt-4 pb-4 gap-4">
              <FamilyPagination
                familyGroups={familyGroups}
                currentFamily={currentFamily}
                onFamilyChange={setCurrentFamily}
                disabled={loading}
                showAllOption={true}
                allOptionText="Todas las familias"
              />
              {/* Barra de Busqueda */}
              <input
                type="text"
                placeholder="Buscar por código o nombre del producto..."
                className="w-full p-4 my-4 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Información de resultados */}
            <div className="mb-4 text-sm text-gray-600">
              Mostrando {filteredDetalles.length} de {detalles.length} productos
              {currentFamily && ` en la familia "${currentFamily}"`}
              {searchTerm && ` que coinciden con "${searchTerm}"`}
            </div>
          </>
        )}

        {filteredDetalles.length === 0 && detalles.length > 0 ? (
          <p className="mt-4 text-center text-gray-500">
            No se encontraron productos que coincidan con los filtros aplicados
          </p>
        ) : detalles.length === 0 ? (
          <p className="mt-4">No se encontraron detalles para este acopio</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Familia Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Nombre Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Código Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Unidad
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDetalles.map((detalle: DetalleOrdenAcopio) => (
                  <tr key={detalle.id}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.unidad_medida}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
