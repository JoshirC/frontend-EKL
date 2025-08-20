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
};

const GuiaSalidaModal: React.FC<GuiaSalidaModalProps> = ({
  isOpen,
  onClose,
  guiaIds,
}) => {
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
      setShowAlert(true);
    },
  });
  const handleEditPallets = () => {
    if (!data?.guiasDeSalidaPorIds) return;

    const idsPallets = data.guiasDeSalidaPorIds.flatMap(
      (guia: any) => guia.pallet?.id || []
    );

    editarEstadoPallets({
      variables: {
        ids: idsPallets,
        estado: "Cerrado",
      },
    });
  };
  const handleEnviarCorreo = () => {
    if (!data?.guiasDeSalidaPorIds) return;

    const idsGuias = data.guiasDeSalidaPorIds.map((guia: any) => guia.id);

    enviarCorreo({
      variables: {
        ids: idsGuias,
      },
    });
  };
  // Función para crear una fila CSV con todas las columnas numeradas
  function crearFilaCSV(
    campos: Partial<Record<string, string | number>>
  ): Record<string, string | number> {
    const fila: Record<string, string | number> = {};

    for (let i = 1; i <= 153; i++) {
      const keyCompleta = Object.keys(campos).find((k) =>
        k.startsWith(`${i}.`)
      );

      if (keyCompleta) {
        fila[keyCompleta] = campos[keyCompleta] ?? "";
      } else {
        fila[`${i}.`] = "";
      }
    }

    return fila;
  }

  // Función para exportar a CSV
  const exportarACSV = () => {
    if (!data?.guiasDeSalidaPorIds) return;

    const datos = data.guiasDeSalidaPorIds.flatMap(
      (guia: any) =>
        guia.pallet?.envios
          ?.filter((envio: any) => envio.cantidad_enviada > 0)
          .map((envio: any) =>
            crearFilaCSV({
              "1. Codigo Bodega": guia.codigo_bodega,
              "2. Folio": guia.numero_folio,
              "3. Tipo Documento": "S",
              "4. Sub Tipo Documento": "T",
              "5. Fecha": guia.fecha_generacion.replace(/\//g, "-"),
              "6. Concepto de Salida": guia.concepto_salida,
              "7. Observacion": guia.descripcion || "N/A",
              "15. Codigo Centro Costo": guia.codigo_centro_costo,
              "60. Codigo Producto": envio.codigo_producto_enviado,
              "62. Descripcion Producto":
                envio.producto?.nombre_producto || "N/A",
              "64. Cantidad Despachada": envio.cantidad_enviada,
              "82. Conserva Folio Asignado DTE": "S",
            })
          ) || []
    );

    // Convertir datos a CSV
    if (datos.length === 0) return;

    const headers = Object.keys(datos[0]);
    const csvContent = [
      headers.join(";"), // Encabezados
      ...datos.map((fila: Record<string, string | number>) =>
        headers
          .map((header) => {
            let valor = fila[header];

            // Procesar cantidad despachada para convertir punto a coma
            if (
              header === "64. Cantidad Despachada" &&
              typeof valor === "number"
            ) {
              valor = valor.toString().replace(".", ",");
            }

            // Escapar valores que contienen punto y coma o comillas
            if (
              typeof valor === "string" &&
              (valor.includes(";") || valor.includes('"'))
            ) {
              return `"${valor.replace(/"/g, '""')}"`;
            }
            return valor;
          })
          .join(";")
      ),
    ].join("\n");

    // Crear y descargar el archivo
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const fechaActual = `${anio}_${mes}_${dia}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${fechaActual}_G_S_${codigoAleatorio}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    handleEditPallets();
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
              className="bg-blue-400 hover:bg-blue-500 font-semibold text-white px-4 py-2 rounded"
              onClick={exportarACSV}
              disabled={loading || !data?.guiasDeSalidaPorIds}
            >
              Descargar CSV
            </button>
            <button
              className="bg-orange-400 hover:bg-orange-500 font-semibold text-white px-4 py-2 rounded"
              onClick={handleEnviarCorreo}
              disabled={loading || !data?.guiasDeSalidaPorIds}
            >
              Enviar por Correo
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
                {data.guiasDeSalidaPorIds.flatMap(
                  (guia: any) =>
                    guia.pallet?.envios
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
                      )) || []
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
