"use client";

import React, { useState, use, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import DropdownCambioProducto from "@/components/salida_acopio/DropdownCambioProducto";
import DropdownEnviosDetalleOrdenAcopio from "@/components/salida_acopio/dropdownEnviosDetalleOrdenAcopio";
import DropdownTrazabilidad from "@/components/salida_acopio/dropdownTrazabilidad";
import FormularioGuiaSalida from "@/components/salida_acopio/formularioGuiaSalida";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_DETALLE_ACOPIO,
  UPDATE_ESTADO_ORDEN_ACOPIO,
  UPDATE_CANTIDAD_ENVIO_DETALLE,
  REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
  CREATE_MULTIPLE_ENVIOS_DETALLE,
} from "@/graphql/mutations";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
type Producto = {
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
  cantidad: number;
  trazabilidad: boolean;
};
type Envio = {
  id: number;
  id_detalle_orden_acopio: number;
  cantidad_enviada: number;
  codigo_producto_enviado: string;
  producto: Producto;
};

type DetalleOrdenAcopio = {
  id: number;
  id_orden_acopio: number;
  familia_producto: string;
  nombre_producto: string;
  codigo_producto: string;
  cantidad: number;
  unidad: string;
  enviado: boolean;
  producto: Producto;
  envios: Envio[];
};
type CreateMultipleEnviosResponse = {
  creados: { id: number }[];
  fallidos: {
    id_detalle_orden_acopio: number;
    codigo_producto_enviado: string;
    motivo: string;
  }[];
};

export default function AcopioSalidaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_acopio } = use(params);
  const id_acopio_num = parseFloat(id_acopio);
  const { rutUsuario, rolUsuario } = useJwtStore();

  // Estados
  const [desactivacionBoton, setDesactivacionBoton] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [cerrarModal, setCerrarModal] = useState(false);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [idEnvioEliminar, setIdEnvioEliminar] = useState<number | null>(null);
  const [cantidadesTemporales, setCantidadesTemporales] = useState<
    Record<number, number>
  >({});
  const [dropdownEnviosOpen, setDropdownEnviosOpen] = useState<number | null>(
    null
  );
  const [dropdownCambiarProductoOpen, setDropdownCambiarProductoOpen] =
    useState<number | null>(null);
  const [dropdownTrazabilidadOpen, setDropdownTrazabilidadOpen] = useState<
    number | null
  >(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [loadingSave, setLoadingSave] = useState<number | null>(null);
  const [currentFamily, setCurrentFamily] = useState<string | null>(null);
  const [familyGroups, setFamilyGroups] = useState<string[]>([]);
  const [openModalGuia, setOpenModalGuia] = useState(false);

  // Query para obtener datos
  const { loading, error, data, refetch } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });

  // Procesamiento estable de los datos
  const { groupedByFamily, currentItems } = useMemo(() => {
    const detalles: DetalleOrdenAcopio[] = data?.ordenAcopio?.detalles || [];

    const grouped = detalles.reduce((acc, detalle) => {
      const familia = detalle.producto.familia;
      if (!acc[familia]) acc[familia] = [];
      acc[familia].push(detalle);
      return acc;
    }, {} as Record<string, DetalleOrdenAcopio[]>);

    const families = Object.keys(grouped).sort();
    setFamilyGroups(families); // Actualiza la lista de familias

    return {
      groupedByFamily: grouped,
      currentItems: currentFamily ? grouped[currentFamily] || [] : [],
    };
  }, [data, currentFamily]);

  // Efecto para mantener la familia actual después de refetch
  useEffect(() => {
    if (familyGroups.length > 0) {
      if (!currentFamily) {
        // Primera carga
        setCurrentFamily(familyGroups[0]);
      } else if (!familyGroups.includes(currentFamily)) {
        // Si la familia actual ya no existe después del refetch
        setCurrentFamily(familyGroups[0]);
      }
    }
  }, [familyGroups, currentFamily]);

  // Refetch modificado para mantener posición
  const stableRefetch = async () => {
    const currentFamilyBefore = currentFamily;
    await refetch();
    if (currentFamilyBefore && familyGroups.includes(currentFamilyBefore)) {
      setCurrentFamily(currentFamilyBefore);
    }
  };

  // Mutaciones

  const [createManyEnvios] = useMutation(CREATE_MULTIPLE_ENVIOS_DETALLE, {
    onCompleted: (data) =>
      handleEnvioMasivoCompleted(data, () => setCantidadesTemporales({})),
    onError: (error) => {
      setAlertType("error");
      setAlertMessage("Error general al enviar productos: " + error.message);
      setShowAlert(true);
    },
  });

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        stableRefetch();
        setDesactivacionBoton(false);
      },
      onError: (error) => {
        setDesactivacionBoton(false);
        setAlertType("error");
        setAlertMessage("Error al crear el envío: " + error.message);
        setShowAlert(true);
      },
    }
  );
  const [removeEnvioDetalleOrdenAcopio] = useMutation(
    REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        setAlertType("exitoso");
        setAlertMessage(
          "Los valores del envío han sido anulados correctamente"
        );
        setShowAlert(true);
        setCerrarModal(true);
        stableRefetch();
      },

      onError: (error) => {
        setAlertType("error");
        setAlertMessage("Error al eliminar el envío: " + error.message);
        setShowAlert(true);
      },
    }
  );
  const [updateEstadoEnviado] = useMutation(UPDATE_ESTADO_DETALLE_ACOPIO, {
    onCompleted: stableRefetch,
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(
        "Error al actualizar el estado del envio: " + error.message
      );
      setShowAlert(true);
    },
  });

  const [updateCantidadEnvioDetalle] = useMutation(
    UPDATE_CANTIDAD_ENVIO_DETALLE,
    {
      onCompleted: () => {
        stableRefetch();
        setEditingId(null);
        setEditValue("");
      },
      onError: (error) => {
        setAlertType("error");
        setAlertMessage(
          "Error al actualizar la cantidad del envío: " + error.message
        );
        setShowAlert(true);
      },
    }
  );
  // Handlers
  const handleCambioCantidad = (id: number, valor: number) => {
    setCantidadesTemporales((prev) => ({ ...prev, [id]: valor }));
  };
  const handleCrearEnviosMasivos = async () => {
    const productosFiltrados = currentItems
      .filter(
        (d) =>
          !d.producto.trazabilidad &&
          cantidadesTemporales[d.id] !== undefined &&
          cantidadesTemporales[d.id] !== null
      )
      .map((d) => ({
        id_detalle_orden_acopio: d.id,
        cantidad_enviada: Number(cantidadesTemporales[d.id]),
        codigo_producto_enviado: d.codigo_producto,
      }));

    if (productosFiltrados.length === 0) {
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar cantidad para al menos un producto.");
      setShowAlert(true);
      return;
    }

    setDesactivacionBoton(true);

    try {
      await createManyEnvios({
        variables: {
          input: {
            usuario_rut: rutUsuario,
            productos: productosFiltrados,
          },
        },
      });
    } catch (error) {
      console.error("Error en envío masivo:", error);
    } finally {
      setDesactivacionBoton(false);
    }
  };
  const handleEnvioMasivoCompleted = (
    data: { createManyEnvios: CreateMultipleEnviosResponse },
    resetCantidades: () => void
  ) => {
    const response = data?.createManyEnvios;
    const creados = Array.isArray(response?.creados) ? response.creados : [];
    const fallidos = Array.isArray(response?.fallidos) ? response.fallidos : [];

    if (fallidos.length > 0) {
      const mensajes = fallidos
        .map((f) => {
          const codigo = f?.codigo_producto_enviado ?? "Desconocido";
          const motivo = f?.motivo ?? "Motivo no especificado";
          return `• ${codigo}: ${motivo}`;
        })
        .join("\n");

      setAlertType("advertencia");
      setAlertMessage(
        `Algunos productos no fueron enviados correctamente: ${mensajes}`
      );
      setShowAlert(true);
      resetCantidades();
    }

    if (creados.length > 0 && fallidos.length === 0) {
      setAlertType("exitoso");
      setAlertMessage("Todos los productos fueron enviados correctamente");
      setShowAlert(true);
      resetCantidades(); // Aquí limpias cantidades temporales
    }

    stableRefetch();
  };

  const handleCrearEnvioDetalle = async (
    id_detalle: number,
    cantidad: number,
    codigo: string
  ) => {
    // Busca el detalle correspondiente
    const detalle = currentItems.find((d) => d.id === id_detalle);
    const cantidadSolicitada = detalle?.producto.cantidad ?? 0;

    if (cantidad < 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad no puede ser menor a 0");
      setShowAlert(true);
      setDesactivacionBoton(false);
      return;
    }

    if (cantidad > cantidadSolicitada) {
      setAlertType("advertencia");
      setDesactivacionBoton(false);
      setAlertMessage(
        "La cantidad enviada no puede ser mayor a la disponible en sistema. Cantidad en sistema: " +
          cantidadSolicitada
      );
      setShowAlert(true);
      return;
    }

    if (!rutUsuario) {
      setDesactivacionBoton(false);
      setAlertType("error");
      setAlertMessage("Error: No se ha encontrado el RUT del usuario");
      setShowAlert(true);
      return;
    }

    setLoadingSave(id_detalle);

    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio: Number(id_detalle),
          cantidad_enviada: Number(cantidad),
          codigo_producto_enviado: String(codigo),
          usuario_rut: String(rutUsuario),
        },
      });
    } catch (err) {
      setDesactivacionBoton(false);
      setAlertType("error");
      setAlertMessage("Error al crear el envío, descripción del error: " + err);
      setShowAlert(true);
    } finally {
      setLoadingSave(null);
    }
  };

  const handleEditClick = (detalle: DetalleOrdenAcopio) => {
    setEditingId(detalle.id);
    setEditValue(detalle.envios[0]?.cantidad_enviada?.toString() || "");
  };

  const handleSaveEdit = async (
    detalleId: number,
    envioId: number,
    cantidad_enviada: number
  ) => {
    cantidad_enviada = parseFloat(Number(cantidad_enviada).toFixed(2));
    const detalle = currentItems.find((d) => d.id === detalleId);
    const cantidadSolicitada = detalle?.producto.cantidad ?? 0;
    if (!editValue || isNaN(Number(editValue))) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad no es válida");
      setShowAlert(true);
      return;
    }

    const cantidad = Number(editValue);
    if (cantidad === cantidad_enviada) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad no puede ser igual al envío actual");
      setShowAlert(true);
      return;
    }
    if (cantidad < 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad debe ser mayor o igual a 0");
      setShowAlert(true);
      return;
    }
    if (cantidad > cantidadSolicitada) {
      setAlertType("advertencia");
      setAlertMessage(
        "La cantidad enviada no puede ser mayor a la disponible en sistema . Cantidad en sistema: " +
          cantidadSolicitada
      );
      setShowAlert(true);
      return;
    }

    setEditLoading(detalleId);

    try {
      await updateCantidadEnvioDetalle({
        variables: { id: envioId, cantidad: cantidad },
      });
    } catch (error) {
      setAlertType("error");
      setAlertMessage(
        "Error al actualizar la cantidad del envío, descripción del error: " +
          error
      );
      setShowAlert(true);
    } finally {
      setEditLoading(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };
  const handleDropdownTrazabilidadClick = (id: number) => {
    setDropdownTrazabilidadOpen(dropdownTrazabilidadOpen === id ? null : id);
  };
  const handleDropdownEnviosClick = (id: number) => {
    setDropdownEnviosOpen(dropdownEnviosOpen === id ? null : id);
  };

  const handleDropdownCambiarProductoClick = (id: number) => {
    setDropdownCambiarProductoOpen(
      dropdownCambiarProductoOpen === id ? null : id
    );
  };
  const handleEliminarEnvio = async (id: number) => {
    if (id) {
      try {
        await removeEnvioDetalleOrdenAcopio({ variables: { id } });
      } catch (error) {
        setAlertType("error");
        setAlertMessage(
          "Error al eliminar el envío, decripción del error: " + error
        );
        setShowAlert(true);
      }
    }
  };
  const handleConfirmacion = (confirmado: boolean) => {
    if (confirmado && idEnvioEliminar) {
      handleEliminarEnvio(idEnvioEliminar);
    }
    setIdEnvioEliminar(null);
    setShowConfirmacion(false);
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <h1>Cargando detalles del acopio...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">
            Error al cargar los detalles del acopio, detalle del error:{" "}
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10">
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
          titulo="Anular Envío"
          mensaje={`¿Estás seguro de que deseas anular el envio?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {data.ordenAcopio.estado === "Confirmacion" &&
        rolUsuario != "Bodeguero" ? (
          <div>
            <div className="flex w-full">
              <FormularioGuiaSalida id_orden={data.ordenAcopio.id} />
            </div>
            <h2 className="text-xl font-semibold">Detalles Orden de Acopio</h2>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="text-xl sm:text-2xl font-semibold">
              Detalle de Acopio N°{id_acopio}
            </div>
            <button
              className={`bg-gray-400 text-white font-semibold px-4 py-2 rounded transition duration-200
    ${
      desactivacionBoton
        ? "bg-gray-400 cursor-not-allowed "
        : "hover:bg-gray-500"
    }
  `}
              onClick={() =>
                (window.location.href = "/salida/acopio_productos")
              }
              disabled={desactivacionBoton}
            >
              Salir
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-around items-center my-4 gap-4 sm:gap-6 font-bold">
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Centro de Costo - {data.ordenAcopio.centroCosto}
          </div>
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Fecha - {data.ordenAcopio.fecha}
          </div>
          <div className="bg-gray-200 p-3 sm:p-4 text-black rounded w-full text-center">
            Estado - {data.ordenAcopio.estado}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Unidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Solicitada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Enviada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((detalle) => (
                <React.Fragment key={detalle.id}>
                  <tr
                    className={`${
                      detalle.envios[0]?.cantidad_enviada === 0
                        ? "bg-gray-100"
                        : detalle.envios.length > 0
                        ? "bg-orange-100"
                        : ""
                    }`}
                  >
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.unidad_medida}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.cantidad}
                    </td>

                    {detalle.envios.length === 0 ? (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {detalle.producto.trazabilidad ? (
                            <button
                              className="bg-blue-400 hover:bg-blue-500 w-full text-white font-semibold py-2 px-2 rounded transition duration-200"
                              onClick={() => {
                                handleDropdownTrazabilidadClick(detalle.id);
                              }}
                            >
                              Trazabilidad
                            </button>
                          ) : (
                            <div className="flex items-center">
                              <input
                                type="number"
                                value={
                                  cantidadesTemporales[detalle.id] !== undefined
                                    ? cantidadesTemporales[detalle.id]
                                    : ""
                                }
                                placeholder={
                                  detalle.producto.cantidad?.toString() || "0"
                                }
                                onChange={(e) =>
                                  handleCambioCantidad(
                                    detalle.id,
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value)
                                  )
                                }
                                min={0}
                                max={detalle.producto.cantidad || 0}
                                className="w-full border border-gray-300 rounded p-1"
                                disabled={desactivacionBoton}
                              />
                              {cantidadesTemporales[detalle.id] !==
                                undefined && (
                                <span className="ml-2 text-red-500 font-semibold">
                                  {detalle.producto.cantidad?.toString() || "0"}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <button
                            onClick={() => {
                              handleDropdownCambiarProductoClick(detalle.id);
                              setLoadingSave(detalle.id);
                            }}
                            className={`w-full text-white font-semibold py-2 px-2 rounded transition duration-200
    ${
      loadingSave === detalle.id
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
        : "bg-orange-400 hover:bg-orange-500"
    }
  `}
                          >
                            Cambiar Producto
                          </button>
                        </td>
                      </>
                    ) : detalle.envios.length > 1 ? (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <button
                            onClick={() => {
                              handleDropdownEnviosClick(detalle.id);
                              setLoadingSave(detalle.id);
                            }}
                            className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full
    ${
      loadingSave === detalle.id
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
        : "bg-orange-400 hover:bg-orange-500"
    }
  `}
                            disabled={loadingSave === detalle.id}
                          >
                            Ver Envíos
                          </button>
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2"></td>
                      </>
                    ) : detalle.codigo_producto !==
                      detalle.envios[0].codigo_producto_enviado ? (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold">
                          {detalle.envios[0]?.cantidad_enviada || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <button
                            className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                              loadingSave === detalle.id
                                ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                : "bg-orange-400 hover:bg-orange-500"
                            }`}
                            onClick={() => {
                              handleDropdownEnviosClick(detalle.id);
                              setLoadingSave(detalle.id);
                            }}
                            disabled={loadingSave === detalle.id}
                          >
                            Ver Envio
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {editingId === detalle.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-20 border border-gray-300 rounded p-1"
                              />
                              <button
                                onClick={() =>
                                  handleSaveEdit(
                                    detalle.id,
                                    detalle.envios[0].id,
                                    detalle.envios[0].cantidad_enviada
                                  )
                                }
                                disabled={editLoading === detalle.id}
                                className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                                  loadingSave === detalle.id
                                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                    : "bg-orange-400 hover:bg-orange-500"
                                }
  `}
                              >
                                Guardar
                              </button>
                            </div>
                          ) : (
                            detalle.envios[0]?.cantidad_enviada || "N/A"
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {editingId === detalle.id ? (
                            <button
                              onClick={handleCancelEdit}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded transition duration-200 w-full"
                            >
                              Cancelar
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              {detalle.envios[0].cantidad_enviada != 0 && (
                                <button
                                  onClick={() => handleEditClick(detalle)}
                                  className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full
    ${
      loadingSave === detalle.id
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
        : "bg-orange-400 hover:bg-orange-500"
    }
  `}
                                  disabled={loadingSave === detalle.id}
                                >
                                  Editar
                                </button>
                              )}

                              <button
                                className={`font-semibold py-2 px-4 rounded transition duration-200 w-full
                                  ${
                                    loadingSave === detalle.id
                                      ? "bg-gray-400 cursor-not-allowed text-white"
                                      : "bg-red-500 hover:bg-red-600 text-white"
                                  }
                                `}
                                onClick={() => {
                                  setShowConfirmacion(true);
                                  setIdEnvioEliminar(detalle.envios[0].id);
                                }}
                                disabled={loadingSave === detalle.id}
                              >
                                Anular
                              </button>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>

                  {dropdownEnviosOpen === detalle.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border-0 p-2 sm:p-4 bg-gray-100"
                      >
                        <DropdownEnviosDetalleOrdenAcopio
                          id_detalle_orden_acopio={detalle.id}
                          isOpen={true}
                          onClose={() => {
                            setDropdownEnviosOpen(null);
                            setLoadingSave(null);
                          }}
                          onProcesoCompleto={stableRefetch}
                        />
                      </td>
                    </tr>
                  )}

                  {dropdownCambiarProductoOpen === detalle.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border-0 p-2 sm:p-4 bg-gray-100 "
                      >
                        <DropdownCambioProducto
                          id_detalle_orden_acopio={detalle.id}
                          cantidad={detalle.cantidad}
                          producto={detalle.producto}
                          isOpen={true}
                          onClose={() => {
                            setDropdownCambiarProductoOpen(null);
                            setLoadingSave(null);
                          }}
                          onProductoEnviado={stableRefetch}
                        />
                      </td>
                    </tr>
                  )}
                  {dropdownTrazabilidadOpen === detalle.id && (
                    <tr>
                      <td
                        colSpan={7}
                        className="border-0 p-2 sm:p-4 bg-gray-100"
                      >
                        <DropdownTrazabilidad
                          id_detalle_orden_acopio={detalle.id}
                          codigo_producto={detalle.codigo_producto}
                          isOpen={true}
                          onClose={() => {
                            setDropdownTrazabilidadOpen(null);
                            setLoadingSave(null);
                          }}
                          onTrazabilidadCompleta={stableRefetch}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-6">
            <button
              className={`bg-blue-400 text-white font-semibold py-2 px-6 rounded transition duration-200 ${
                desactivacionBoton
                  ? "bg-gray-400 cursor-not-allowed"
                  : "hover:bg-blue-500"
              }`}
              onClick={handleCrearEnviosMasivos}
              disabled={desactivacionBoton}
            >
              Enviar Productos
            </button>
          </div>

          {/* Paginación por familia */}
          <div className="flex flex-col sm:flex-row justify-end items-center mt-6 pb-4 gap-4">
            <div className="flex items-center gap-2 sm:w-auto w-full">
              <button
                onClick={() => {
                  const currentIndex = familyGroups.indexOf(
                    currentFamily || ""
                  );
                  if (currentIndex > 0) {
                    setCurrentFamily(familyGroups[currentIndex - 1]);
                  }
                }}
                disabled={
                  desactivacionBoton ||
                  !currentFamily ||
                  familyGroups.indexOf(currentFamily) === 0
                }
                className={`p-3 rounded font-semibold text-sm sm:text-base
    ${
      desactivacionBoton ||
      !currentFamily ||
      familyGroups.indexOf(currentFamily) === 0
        ? "bg-gray-200 cursor-not-allowed"
        : "bg-orange-500 hover:bg-orange-600 text-white"
    }
  `}
              >
                Anterior
              </button>

              <div className="flex-1 overflow-x-hidden">
                <div className="flex space-x-2 justify-center">
                  {familyGroups
                    .slice(
                      Math.max(
                        0,
                        Math.min(
                          familyGroups.indexOf(currentFamily || "") - 2,
                          familyGroups.length - 5
                        )
                      ),
                      Math.min(
                        familyGroups.indexOf(currentFamily || "") + 3,
                        familyGroups.length
                      )
                    )
                    .map((family) => (
                      <button
                        key={family}
                        onClick={() => setCurrentFamily(family)}
                        disabled={desactivacionBoton}
                        className={`p-3 rounded text-sm sm:text-base font-semibold min-w-max whitespace-nowrap ${
                          currentFamily === family
                            ? "bg-gray-400 text-white"
                            : "bg-gray-100 hover:bg-gray-300 text-gray-800"
                        }`}
                      >
                        <span className="max-w-[100px] sm:max-w-[150px] truncate">
                          {family}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <button
                onClick={() => {
                  const currentIndex = familyGroups.indexOf(
                    currentFamily || ""
                  );
                  if (currentIndex < familyGroups.length - 1) {
                    setCurrentFamily(familyGroups[currentIndex + 1]);
                  }
                }}
                disabled={
                  desactivacionBoton ||
                  !currentFamily ||
                  familyGroups.indexOf(currentFamily) ===
                    familyGroups.length - 1
                }
                className={`p-3 rounded font-semibold text-sm sm:text-base
    ${
      desactivacionBoton ||
      !currentFamily ||
      familyGroups.indexOf(currentFamily) === familyGroups.length - 1
        ? "bg-gray-200 cursor-not-allowed"
        : "bg-orange-500 hover:bg-orange-600 text-white"
    }
  `}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
