"use client";
import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import NuevaOrdenAcopio from "@/components/adquisiciones/nuevaOrdenAcopio";
import Alert from "@/components/Alert";
import { GET_ORDENES_ACOPIO } from "@/graphql/query";
import {
  ELIMINAR_LISTA_ORDEN_ACOPIO,
  EDITAR_LISTA_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import ListaVacia from "@/components/listaVacia";
import Confirmacion from "@/components/confirmacion";
import Cargando from "@/components/cargando";
import { OrdenAcopio } from "@/types/graphql";
const AcopioPage: React.FC = () => {
  const [modalNuevaOrdenAcopio, setModalNuevaOrdenAcopio] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [cerrarModal, setCerrarModal] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [tituloConfirmacion, setTituloConfirmacion] = useState("");
  const [estadoConfirmacion, setEstadoConfirmacion] = useState("");
  const [cargandoMensaje, setCargandoMensaje] = useState("");
  const [botonCargando, setBotonCargando] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_ORDENES_ACOPIO, {
    variables: { estado: "Comprar" },
  });

  const abrirModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(true);
  };

  const cerrarModalNuevaOrdenAcopio = () => {
    setModalNuevaOrdenAcopio(false);
  };
  const [eliminarListaOrdenAcopio] = useMutation(ELIMINAR_LISTA_ORDEN_ACOPIO, {
    onCompleted: () => {
      setCargandoMensaje("");
      setBotonCargando(false);
      setAlertType("exitoso");
      setAlertMessage("Solicitudes eliminadas correctamente");
      setShowAlert(true);
      refetch();
    },
    onError: (error) => {
      setCargandoMensaje("");
      setBotonCargando(false);
      setAlertType("error");
      setAlertMessage(error.message);
      setShowAlert(true);
    },
  });
  const [editarListaOrdenAcopio] = useMutation(EDITAR_LISTA_ORDEN_ACOPIO, {
    onCompleted: () => {
      setCargandoMensaje("");
      setBotonCargando(false);
      setAlertType("exitoso");
      setAlertMessage("Solicitudes confirmadas correctamente");
      setShowAlert(true);
      refetch();
    },
    onError: (error) => {
      setCargandoMensaje("");
      setBotonCargando(false);
      setAlertType("error");
      setAlertMessage(error.message);
      setShowAlert(true);
    },
  });
  const handleCargaCompleta = async () => {
    try {
      await refetch();
      setAlertType("exitoso");
      setAlertMessage("El Consolidado se ha subido correctamente");
      setShowAlert(true);
      setCerrarModal(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al actualizar la lista de órdenes");
      setShowAlert(true);
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado) {
      const ordenesID = data.ordenAcopiosByEstado.map(
        (orden: OrdenAcopio) => orden.id
      );
      if (ordenesID.length === 0) {
        setAlertType("advertencia");
        setAlertMessage("No hay solicitudes para procesar");
        setShowAlert(true);
        return;
      }
      if (estadoConfirmacion === "confirmar") {
        setCargandoMensaje("Confirmando solicitudes...");
        setBotonCargando(true);
        editarListaOrdenAcopio({
          variables: {
            orderIds: ordenesID,
            newStatus: "Pendiente",
          },
        });
      } else if (estadoConfirmacion === "eliminar") {
        setCargandoMensaje("Eliminando solicitudes...");
        setBotonCargando(true);
        eliminarListaOrdenAcopio({
          variables: {
            orderIds: ordenesID,
          },
        });
      }
    }
    setShowConfirmacion(false);
  };
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando solicitudes de abastecimiento...</p>
        </div>
      </div>
    );
  }
  if (error) {
    setAlertType("error");
    setAlertMessage(error.message);
    setShowAlert(true);
  }

  const ordenes: OrdenAcopio[] = data.ordenAcopiosByEstado;

  return (
    <div className="p-4 sm:p-10">
      <NuevaOrdenAcopio
        isOpen={modalNuevaOrdenAcopio}
        onClose={cerrarModalNuevaOrdenAcopio}
        onCargaCompleta={handleCargaCompleta}
      />
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={cerrarModal}
        />
      )}
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          onClose={() => setShowConfirmacion(false)}
          titulo={tituloConfirmacion}
          mensaje={mensajeConfirmacion}
          onConfirm={handleConfirmacion}
        />
      )}
      {botonCargando && (
        <Cargando
          isOpen={botonCargando}
          mensaje={cargandoMensaje}
          onClose={() => setBotonCargando(false)}
        />
      )}{" "}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Solicitudes de Abastecimiento
          </div>
          <div className="space-x-2">
            <button
              className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                setShowConfirmacion(true);
                setTituloConfirmacion("Confirmar Solicitudes");
                setMensajeConfirmacion(
                  "¿Estás seguro de que deseas confirmar todas las solicitudes?"
                );
                setEstadoConfirmacion("confirmar");
              }}
            >
              Confirmar Solicitudes
            </button>
            <button
              className="bg-red-500 text-white font-semibold p-3 sm:p-4 rounded hover:bg-red-600 transition duration-300 w-full sm:w-auto"
              onClick={() => {
                setShowConfirmacion(true);
                setTituloConfirmacion("Eliminar Solicitudes");
                setMensajeConfirmacion(
                  "¿Estás seguro de que deseas eliminar todas las solicitudes?"
                );
                setEstadoConfirmacion("eliminar");
              }}
            >
              Cancelar Solicitudes
            </button>
            <button
              className="bg-gray-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-gray-500 transition duration-300 w-full sm:w-auto"
              onClick={abrirModalNuevaOrdenAcopio}
            >
              Nueva Solicitud
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">ID</th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Centro Costo
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Fecha Despacho
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Estado
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <ListaVacia mensaje="No solicitudes disponibles para confirmar." />
                  </td>
                </tr>
              ) : null}
              {ordenes.map((orden) => (
                <tr key={orden.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.id}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.centro_costo}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.fecha_despacho}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {orden.estado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    <button
                      className="bg-orange-400 text-white font-semibold px-3 sm:px-4 py-2 w-full rounded hover:bg-orange-500 transition duration-300"
                      onClick={() => {
                        window.location.href = `/adquisiciones/${orden.id}`;
                      }}
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AcopioPage;
