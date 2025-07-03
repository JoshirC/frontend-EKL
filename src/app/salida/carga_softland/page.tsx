"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_GUIAS_DE_SALIDA_SOFTLAND } from "@/graphql/query";
import { UPDATE_ESTADO_ORDEN_ACOPIO } from "@/graphql/mutations";
import Alert from "@/components/Alert";

import * as XLSX from "xlsx";
type GuiaSalida = {
  id: number;
  codigo_bodega: string;
  numero_folio: number;
  fecha_generacion: string;
  concepto_salida: string;
  codigo_cliente: string;
  codigo_centro_costo: string;
  usuario_creacion: string;
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
  const exportarAExcel = () => {
    const datos = guias.flatMap((guia) =>
      guia.envios.map((envio) => ({
        "1": guia.codigo_bodega,
        "2": guia.numero_folio,
        "3": guia.fecha_generacion,
        "4": guia.concepto_salida,
        "5": "",
        "6": guia.codigo_cliente,
        "7": guia.codigo_centro_costo,
        "8": "",
        "9": "",
        "10": "",
        "11": "",
        "12": "",
        "13": "",
        "14": "",
        "15": "",
        "16": "",
        "17": "",
        "18": "",
        "19": "",
        "20": "",
        "21": "",
        "22": "",
        "23": "",
        "24": "",
        "25": "",
        "26": "",
        "27": "",
        "28": "",
        "29": "",
        "30": "",
        "31": "",
        "32": "",
        "33": "",
        "34": "",
        "35": "",
        "36": "",
        "37": guia.valor_total?.toFixed(2) ?? "0.00",
        "38": envio.codigo_producto_enviado,
        "39": envio.producto.nombre_producto,
        "40": envio.producto.unidad_medida,
        "41": envio.cantidad_enviada,
        "42": envio.producto.precio_unitario?.toFixed(2) ?? "0.00",
        "43": "",
        "44": "",
        "45": "",
        "46": "",
        "47": "",
        "48": "",
        "49": "",
        "50": "",
        "51": "",
        "52": "",
        "53": "",
        "54": "",
        "55": "",
        "56": "",
        "57": "",
        "58": "",
      }))
    );
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const fechaActual = `${dia}-${mes}-${anio}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guias de Salida");
    XLSX.writeFile(workbook, `carga-masiva-guia-salida-${fechaActual}.xlsx`);

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
  const handleCambiarEstado = (id_orden: string) => {
    setBotonCargando(true);
    updateEstadoOrden({
      variables: {
        id: parseFloat(id_orden),
        estado: "Cerrado",
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
            Exportar a Excel
          </button>
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
                  Código Cliente
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Centro Costo
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Usuario Creación
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
                guia.envios.map((envio) => (
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
                      {guia.codigo_cliente}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.codigo_centro_costo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.usuario_creacion}
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
