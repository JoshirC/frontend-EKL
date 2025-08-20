"use client";
import React, { useEffect, useMemo, useState } from "react";
import { GET_GUIA_ENTRADA_BY_ESTADO } from "@/graphql/query";
import {
  UPDATE_ESTADO_GUIA_ENTRADAS,
  ENVIAR_CORREO_GUIA_ENTRADA,
} from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
import * as XLSX from "xlsx";
import Alert from "@/components/Alert";
type Producto = {
  codigo: string;
  nombre_producto: string;
};

type GuiaEntradaDetalle = {
  id: number;
  cantidad_ingresada: number;
  precio_unitario: number;
  producto: Producto;
};

type GuiaEntrada = {
  id: number;
  codigo_bodega: string;
  numero_folio: number;
  fecha_generacion: string;
  codigo_proveedor: string;
  observacion: string;
  numero_factura: number;
  fecha_factura: string;
  numero_orden_compra: string;
  estado: string;
  guiaEntradaDetalle: GuiaEntradaDetalle[];
};
const CargaSoftlandPage: React.FC = () => {
  function crearFilaExcel(
    campos: Partial<Record<string, string | number>>
  ): Record<string, string | number> {
    const fila: Record<string, string | number> = {};

    for (let i = 1; i <= 31; i++) {
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
    const datos = guiasEntrada.flatMap((guia) =>
      guia.guiaEntradaDetalle.map((detalle) =>
        crearFilaExcel({
          "1. Codigo Bodega": guia.codigo_bodega,
          "2. Folio": guia.numero_folio,
          "3. Fecha": guia.fecha_generacion.replace(/\//g, "-"),
          "4. Concepto": "02",
          "5. Descripcion": guia.observacion || "N/A",
          "6. Codigo Proveedor": guia.codigo_proveedor,
          "11. Numero Factura": guia.numero_factura,
          "13. Fecha Factura": guia.fecha_factura.replace(/\//g, "-"),
          "16. Numero Orden Compra": guia.numero_orden_compra,
          "21. Codigo Producto": detalle.producto?.codigo ?? "N/A",
          "22. Descripcion Producto":
            detalle.producto?.nombre_producto ?? "N/A",
          "23. Cantidad Ingresada": detalle.cantidad_ingresada,
          "24. Precio Unitario": detalle.precio_unitario ?? "0.00",
          "31. Tipo Factura": 33,
        })
      )
    );

    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Guias de Entrada");

    const fecha = new Date();
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const codigoAleatorio = Math.floor(1000 + Math.random() * 9000);
    const fechaActual = `${anio}_${mes}_${dia}`;
    XLSX.writeFile(workbook, `${fechaActual}_G_E_${codigoAleatorio}.xlsx`);
    const listaIds = guiasEntrada.map((guia) => guia.id);
    handleActualizarEstado(listaIds, "Cargada");
  };
  // Estado para almacenar el mensaje de alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [botonCargando, setBotonCargando] = useState(false);
  const { loading, error, data } = useQuery(GET_GUIA_ENTRADA_BY_ESTADO, {
    variables: { estado: "Subir" },
  });
  const [updateEstadoGuiaEntrada] = useMutation(UPDATE_ESTADO_GUIA_ENTRADAS, {
    refetchQueries: [
      { query: GET_GUIA_ENTRADA_BY_ESTADO, variables: { estado: "Subir" } },
    ],
  });
  const [enviarExcelGuias] = useMutation(ENVIAR_CORREO_GUIA_ENTRADA, {
    onCompleted: () => {
      handleActualizarEstado(
        guiasEntrada.map((guia) => guia.id),
        "Cargada"
      );
    },
    onError: (error) => {
      console.error("Error al enviar el correo:", error);
      setShowAlert(true);
      setAlertType("error");
      setAlertMessage("Error al enviar el correo con las guías de entrada.");
    },
  });
  const handleActualizarEstado = async (listId: number[], estado: string) => {
    try {
      await updateEstadoGuiaEntrada({
        variables: { listId, estado },
      });
      setShowAlert(true);
      setAlertType("exitoso");
      setAlertMessage("Archivo Generado exitosamente");
      setBotonCargando(false);
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Ocultar alerta después de 3 segundos
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      setShowAlert(true);
      setAlertType("error");
      setAlertMessage("Error al actualizar el estado de las guías de entrada.");
    }
  };
  const handleEnviarExcel = () => {
    setBotonCargando(true);
    enviarExcelGuias({
      variables: {
        guias: guiasEntrada.map((guia) => guia.id),
      },
    });
  };
  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando guías de entrada...</p>
        </div>
      </div>
    );
  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>
            Error al cargar guías de entrada, descripción del error:{" "}
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const guiasEntrada: GuiaEntrada[] = data?.guiaEntradaByEstado || [];
  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={true}
        />
      )}
      {/* Contenedor principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Título de la página */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold mb-4">
            Carga Softland Guias de Entrada
          </h1>
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto">
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
              disabled={botonCargando}
            >
              Descargar a Excel
            </button>
            <button
              className={`${
                botonCargando
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-400 hover:bg-blue-500"
              } text-white font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap ml-0 sm:ml-4 mt-4 sm:mt-0`}
              onClick={() => {
                handleEnviarExcel();
                setBotonCargando(true);
              }}
            >
              Enviar Excel por Correo
            </button>
          </div>
        </div>
        {/* Tabla de datos */}
        <div className="overflow-x-auto mt-6">
          <table className="table-auto w-full text-center border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  N° Folio
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  N° Orden Compra
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  N° Factura
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Bodega
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Nombre Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Ingresada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio Unitario
                </th>
              </tr>
            </thead>
            <tbody>
              {guiasEntrada.flatMap((guia) =>
                guia.guiaEntradaDetalle.map((detalle) => (
                  <tr key={`${guia.id}-${detalle.id}`}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_folio}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_orden_compra}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_factura}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.observacion || "N/A"}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.codigo_bodega}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad_ingresada}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.precio_unitario.toFixed(2)}
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
