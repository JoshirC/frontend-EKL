"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_GUIAS_DE_SALIDA_SOFTLAND } from "@/graphql/query";
import {
  UPDATE_ESTADO_ORDEN_ACOPIO,
  ENVIAR_CORREO_GUIA_SALIDA,
} from "@/graphql/mutations";
import Alert from "@/components/Alert";

import * as XLSX from "xlsx";
type GuiaSalida = {
  id: number;
  codigo_bodega: string;
  numero_folio: number;
  fecha_generacion: string;
  concepto_salida: string;
  codigo_centro_costo: string;
  descripcion: string;
  codigo_lugar_despacho: string;
  valor_total: number;
  orden: {
    id: number;
    centroCosto: string;
    estado: string;
  };
  envios: {
    id: number;
    cantidad_enviada: number;
    codigo_producto_enviado: string;
    producto: {
      id: number;
      nombre_producto: string;
      familia: string;
      unidad_medida: string;
      precio_unitario?: number;
    };
  }[];
};

const CargaSoftlandPage: React.FC = () => {
  function crearFilaExcel(
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
  const exportarAExcel = () => {
    const datos = guias.flatMap((guia) =>
      guia.envios
        .filter((envio) => envio.cantidad_enviada > 0)
        .map((envio) =>
          crearFilaExcel({
            "1. Codigo Bodega": guia.codigo_bodega,
            "2. Folio": guia.numero_folio,
            "3. Tipo Documento": "S",
            "4. Sub Tipo Documento": "T",
            "5. Fecha": guia.fecha_generacion.replace(/\//g, "-"),
            "6. Concepto de Salida": guia.concepto_salida,
            "7. Observacion": guia.descripcion || "N/A",
            //"8. Codigo Cliente": "",
            "15. Codigo Centro Costo": guia.codigo_centro_costo,
            "60. Codigo Producto": envio.codigo_producto_enviado,
            "62. Descripcion Producto": envio.producto.nombre_producto,
            "64. Cantidad Despachada": envio.cantidad_enviada,
            "82. Conserva Folio Asignado DTE": "S",
          })
        )
    );
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const fechaActual = `${dia}_${mes}_${anio}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guias de Salida");
    XLSX.writeFile(workbook, `carga_masiva_guia_salida_${fechaActual}.xlsx`);

    guias.forEach((guia) => {
      handleCambiarEstado(guia.orden.id.toString());
    });
    setBotonCargando(false);
  };
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [botonCargando, setBotonCargando] = useState(false);
  const { loading, error, data } = useQuery(GET_GUIAS_DE_SALIDA_SOFTLAND);
  const [updateEstadoOrden] = useMutation(UPDATE_ESTADO_ORDEN_ACOPIO, {
    onCompleted: () => {
      setBotonCargando(false);
      setAlertType("exitoso");
      setAlertMessage(
        "Excel generado y estado de orden actualizado correctamente."
      );
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/salida/revision";
      }, 2000);
    },
    onError: (error) => {
      setBotonCargando(false);
      setAlertType("error");
      setAlertMessage(`${error.message}`);
      setShowAlert(true);
    },
  });
  const [enviarCorreoGuiaSalida] = useMutation(ENVIAR_CORREO_GUIA_SALIDA, {
    onCompleted: () => {
      guias.forEach((guia) => {
        handleCambiarEstado(guia.orden.id.toString());
      });
      setBotonCargando(false);
    },
    onError: (error) => {
      setBotonCargando(false);
      setAlertType("error");
      setAlertMessage(`${error.message}`);
      setShowAlert(true);
    },
  });

  const handleCambiarEstado = (id_orden: string) => {
    setBotonCargando(true);
    updateEstadoOrden({
      variables: {
        id: parseFloat(id_orden),
        estado: "Cerrado",
      },
    });
  };
  const handleEnviarCorreo = () => {
    setBotonCargando(true);
    enviarCorreoGuiaSalida({
      variables: {
        id: guias.map((guia) => guia.id),
      },
    });
  };
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando guías de salida...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>
            Error al cargar guías de salida, descripción del error:{" "}
            {error.message}
          </p>
        </div>
      </div>
    );
  }
  const guias: GuiaSalida[] = data.guiasDeSalidaSoftland;
  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold mb-4">
            Carga Softland Guias de Salida
          </h1>
          <div className="flex sm:flex-row flex-col gap-2 sm:gap-4">
            <button
              className={`${
                botonCargando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-400 hover:bg-orange-500"
              } text-white font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap`}
              onClick={() => {
                exportarAExcel();
                setBotonCargando(true);
              }}
            >
              Descargar Excel
            </button>
            <button
              className={`${
                botonCargando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-400 hover:bg-blue-500"
              } text-white font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap`}
              onClick={() => {
                handleEnviarCorreo();
                setBotonCargando(true);
              }}
            >
              Enviar por Correo
            </button>
          </div>
        </div>
        {/* Tabla de datos */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guias.flatMap((guia) =>
                guia.envios
                  .filter((envio) => envio.cantidad_enviada > 0)
                  .map((envio) => (
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
                        {guia.descripcion}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {guia.codigo_centro_costo}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {envio.codigo_producto_enviado}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {envio.producto.nombre_producto}
                      </td>
                      <td className="border border-gray-300 px-2 sm:px-4 py-2">
                        {envio.cantidad_enviada}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default CargaSoftlandPage;
