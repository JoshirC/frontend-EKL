"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_GUIAS_SALIDA_BY_IDS } from "@/graphql/query";
import {
  CAMBIO_ESTADO_PALLET,
  ENVIAR_CORREO_GUIA_SALIDA,
} from "@/graphql/mutations";
import Alert from "../Alert";

type GuiaSalidaModalProps = {
  isOpen: boolean;
  onClose: () => void;
  guiaIds: string[];
  palletIds: number[];
};
type GuiaSalida = {
  id: string;
  codigo_bodega: string;
  numero_folio: string;
  fecha_generacion: string;
  concepto_salida: string;
  descripcion: string;
  codigo_centro_costo: string;
};
const GuiaSalidaModal: React.FC<GuiaSalidaModalProps> = ({
  isOpen,
  onClose,
  guiaIds,
  palletIds,
}) => {
  const [cargando, setCargando] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");

  const { data, loading, error } = useQuery(GET_GUIAS_SALIDA_BY_IDS, {
    variables: {
      ids: guiaIds.map((id) => parseFloat(id)),
    },
    skip: !isOpen || guiaIds.length === 0,
  });

  const [editarEstadoPallets] = useMutation(CAMBIO_ESTADO_PALLET, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("Formato descargado exitosamente");
      setShowAlert(true);
      setTimeout(() => {
        onClose();
        setAlertMessage("");
        setShowAlert(false);
      }, 3000);
      setCargando(false);
    },
    onError: (error) => {
      setAlertMessage(error.message);
      setAlertType("error");
      setShowAlert(true);
    },
  });

  const [enviarCorreo] = useMutation(ENVIAR_CORREO_GUIA_SALIDA, {
    onCompleted: () => {
      handleEditPallets();
    },
    onError: (error) => {
      setAlertMessage(error.message);
      setAlertType("error");
      setCargando(true);
      setShowAlert(true);
    },
  });

  const handleEditPallets = () => {
    if (palletIds == null) return;
    editarEstadoPallets({
      variables: {
        ids: palletIds,
        estado: "Cerrado",
      },
    });
  };

  const handleEnviarCorreo = () => {
    if (!data?.guiasDeSalidaPorIds) return;
    setCargando(true);
    const idsGuias = data.guiasDeSalidaPorIds.map((guia: any) => guia.id);
    enviarCorreo({
      variables: {
        ids: idsGuias,
      },
    });
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
      <div className="bg-white opacity-100 w-full max-w-6xl rounded shadow-lg p-8 max-h-[90vh] overflow-y-auto">
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
            modal={true}
          />
        )}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            Información de Guías de Salida
          </h2>
          <div className="flex space-x-4">
            <button
              className={`px-4 py-2 rounded font-semibold transition-all duration-200 ${
                cargando
                  ? "bg-gray-400 text-gray-200 shadow-md"
                  : "bg-orange-400 hover:bg-orange-500 text-white"
              }`}
              onClick={handleEnviarCorreo}
              disabled={loading || !data?.guiasDeSalidaPorIds || cargando}
            >
              Enviar CSV por Correo
            </button>
          </div>
        </div>
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error al cargar las guías: {error.message}
          </div>
        )}

        {data?.guiasDeSalidaPorIds && (
          <div className="overflow-x-auto">
            <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    N° Folio
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Fecha Generación
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Concepto Salida
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Descripción
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Centro Costo
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Código Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Nombre Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Cantidad Enviada
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Unidad Medida
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.guiasDeSalidaPorIds.flatMap((guia: any) =>
                  guia.envios
                    ?.filter((envio: any) => envio.cantidad_enviada > 0)
                    .map((envio: any) => (
                      <tr key={`${guia.id}-${envio.id}`}>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {guia.numero_folio}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {guia.fecha_generacion}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {guia.concepto_salida}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {guia.descripcion || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {guia.codigo_centro_costo}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {envio.codigo_producto_enviado}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {envio.producto?.nombre_producto || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {envio.cantidad_enviada}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {envio.producto?.unidad_medida || "N/A"}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuiaSalidaModal;
