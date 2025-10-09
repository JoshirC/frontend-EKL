"use client";
import React, { useState, use, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import DropdownCambioProducto from "@/components/salida_acopio/DropdownCambioProducto";
import DropdownEnviosDetalleOrdenAcopio from "@/components/salida_acopio/dropdownEnviosDetalleOrdenAcopio";
import DropdownTrazabilidad from "@/components/salida_acopio/dropdownTrazabilidad";
import DropdownDividirEnvio from "@/components/salida_acopio/dropdownDividirEnvio";
import FamilyFilter from "@/components/FamilyPagination";
import PalletFilter from "@/components/PalletFilter";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_CANTIDAD_ENVIO_DETALLE,
  REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
import Cargando from "@/components/cargando";
import ModalSelectorPallets from "@/components/salida_acopio/modalSelectorPallets";
import { ordenarProductos } from "@/utils/ordenarProductosConsolidados";
import { DetalleOrdenAcopio } from "@/types/graphql";
import ModalAdicional from "@/components/salida_acopio/modalAdicional";
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
  const [showSelectorPallets, setShowSelectorPallets] = useState(false);
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
  const [numerosPallet, setNumerosPallet] = useState<Record<number, number>>(
    {}
  );
  const [dropdownEnviosOpen, setDropdownEnviosOpen] = useState<number | null>(
    null
  );
  const [dropdownCambiarProductoOpen, setDropdownCambiarProductoOpen] =
    useState<number | null>(null);
  const [dropdownTrazabilidadOpen, setDropdownTrazabilidadOpen] = useState<
    number | null
  >(null);
  const [dropdownDividirEnvioOpen, setDropdownDividirEnvioOpen] = useState<
    number | null
  >(null);
  const [showModalAdicional, setShowModalAdicional] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editPalletValue, setEditPalletValue] = useState<string>("");
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [loadingSave, setLoadingSave] = useState<number | null>(null);
  const [familyGroups, setFamilyGroups] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [palletGroups, setPalletGroups] = useState<number[]>([]);
  const [selectedPallet, setSelectedPallet] = useState<number | null>(null);
  const [showCargando, setShowCargando] = useState(false);
  // Query para obtener datos
  const { loading, error, data, refetch } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_acopio_num },
  });

  // Procesamiento estable de los datos
  const { groupedByFamily, currentItems } = useMemo(() => {
    const detalles: DetalleOrdenAcopio[] = data?.ordenAcopio?.detalles || [];

    // 1️⃣ Agrupar por familia
    const grouped = detalles.reduce((acc, detalle) => {
      const familia = detalle.familia_planilla;
      if (!acc[familia]) acc[familia] = [];
      acc[familia].push(detalle);
      return acc;
    }, {} as Record<string, DetalleOrdenAcopio[]>);

    const families = Object.keys(grouped).sort();
    setFamilyGroups(families);

    // 2️⃣ Obtener pallets únicos
    const pallets = new Set<number>();
    detalles.forEach((detalle) => {
      detalle.envios?.forEach((envio) => {
        if (envio.pallet?.numero_pallet)
          pallets.add(envio.pallet.numero_pallet);
      });
    });
    setPalletGroups(Array.from(pallets).sort((a, b) => a - b));

    // 3️⃣ Filtrado por familia seleccionada
    let filteredItems: DetalleOrdenAcopio[] = [];
    if (selectedFamilies.length > 0) {
      selectedFamilies.forEach((familia) => {
        if (grouped[familia])
          filteredItems = filteredItems.concat(grouped[familia]);
      });
    } else {
      filteredItems = detalles;
    }

    // 4️⃣ Filtrado por pallet
    if (selectedPallet !== null) {
      filteredItems = filteredItems.filter((detalle) =>
        detalle.envios?.some((e) => e.pallet?.numero_pallet === selectedPallet)
      );
    }

    // 5️⃣ Filtrado por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (detalle) =>
          detalle.codigo_producto.toLowerCase().includes(term) ||
          detalle.producto.nombre_producto.toLowerCase().includes(term)
      );
    }

    // 6️⃣ Función para calcular prioridad global (ahora incluye rojo)
    const getPrioridad = (d: DetalleOrdenAcopio) => {
      const solicitada = d.cantidad ?? 0;
      const enviada =
        d.envios?.reduce((sum, e) => sum + (e.cantidad_enviada ?? 0), 0) ?? 0;
      const tieneEnvios = (d.envios?.length ?? 0) > 0;
      const cerrado = d.envios?.some((e) => e.pallet?.estado === "Cerrado");

      // 🔹 0: normal / 1: cerrado / 2: con envíos / 3: incompleto / 4: envío = 0
      if (tieneEnvios && enviada === 0) return 4; // rojo
      if (tieneEnvios && enviada < solicitada) return 3; // azul
      if (tieneEnvios) return 2; // naranjo
      if (cerrado) return 1; // gris
      return 0; // normal
    };

    // 7️⃣ Agrupar por familia (para mantener orden del negocio)
    const agrupadosPorFamilia: Record<string, DetalleOrdenAcopio[]> = {};
    filteredItems.forEach((d) => {
      const f = d.familia_planilla;
      if (!agrupadosPorFamilia[f]) agrupadosPorFamilia[f] = [];
      agrupadosPorFamilia[f].push(d);
    });

    // 8️⃣ Ordenar familias según el utilitario
    const familiasOrdenadas = ordenarProductos(
      Object.keys(agrupadosPorFamilia).map((familia) => ({
        familia,
        codigo_producto: "",
        descripcion_producto: "",
        unidad: "",
      }))
    ).map((f) => f.familia);

    // 9️⃣ Reconstruir lista manteniendo orden de familia
    let resultadoFinal: DetalleOrdenAcopio[] = [];
    for (const f of familiasOrdenadas) {
      const productos = agrupadosPorFamilia[f] || [];
      productos.sort((a, b) =>
        a.producto.nombre_producto.localeCompare(
          b.producto.nombre_producto,
          "es",
          {
            sensitivity: "base",
          }
        )
      );
      resultadoFinal = resultadoFinal.concat(productos);
    }

    // 🔟 Orden global final por prioridad
    resultadoFinal.sort((a, b) => getPrioridad(a) - getPrioridad(b));

    return {
      groupedByFamily: grouped,
      currentItems: resultadoFinal,
    };
  }, [data, selectedFamilies, searchTerm, selectedPallet]);

  // Refetch simplificado
  const stableRefetch = async () => {
    await refetch();
  };

  // Mutaciones

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
    {
      onCompleted: (data, context) => {
        stableRefetch();
        setDesactivacionBoton(false);

        // Si el envío fue exitoso y tenemos el ID del detalle, limpiamos las cantidades temporales y pallet
        const detalleId = context?.variables?.id_detalle_orden_acopio;
        if (detalleId) {
          setCantidadesTemporales((prev) => {
            const newState = { ...prev };
            delete newState[detalleId];
            return newState;
          });
          setNumerosPallet((prev) => {
            const newState = { ...prev };
            delete newState[detalleId];
            return newState;
          });
        }
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
  const [updateEstadoOrdenAcopio] = useMutation(UPDATE_ESTADO_ORDEN_ACOPIO, {
    onCompleted: () => {
      stableRefetch();
      setEditingId(null);
      setEditValue("");
      setShowCargando(false);
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(
        "Error al actualizar el estado de la orden de acopio: " + error.message
      );
      setShowAlert(true);
    },
  });
  // Handlers
  const handleCambioCantidad = (id: number, valor: number) => {
    setCantidadesTemporales((prev) => ({ ...prev, [id]: valor }));
  };

  const handleCambioNumeroPallet = (id: number, valor: number) => {
    setNumerosPallet((prev) => ({ ...prev, [id]: valor }));
  };

  const handleEnvioUnico = async (detalleId: number) => {
    const cantidad = cantidadesTemporales[detalleId];
    const numeroPallet = numerosPallet[detalleId];

    if (cantidad === undefined || cantidad === null || cantidad < 0) {
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar una cantidad válida para enviar");
      setShowAlert(true);
      return;
    }

    // Si la cantidad es mayor a 0, debe haber un número de pallet válido
    if (
      cantidad > 0 &&
      (numeroPallet === undefined || numeroPallet === null || numeroPallet <= 0)
    ) {
      setAlertType("advertencia");
      setAlertMessage(
        "Debe ingresar un número de pallet válido cuando la cantidad es mayor a 0"
      );
      setShowAlert(true);
      return;
    }

    const detalle = currentItems.find((d) => d.id === detalleId);
    if (!detalle) {
      setAlertType("error");
      setAlertMessage("No se encontró el detalle del producto");
      setShowAlert(true);
      return;
    }

    setDesactivacionBoton(true);

    try {
      await handleCrearEnvioDetalle(
        detalleId,
        cantidad,
        detalle.codigo_producto,
        cantidad > 0 ? numeroPallet : 0
      );
    } catch (error) {
      setDesactivacionBoton(false);
    }
  };
  const handleCrearEnvioDetalle = async (
    id_detalle: number,
    cantidad: number,
    codigo: string,
    numero_pallet: number
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
      const variables: any = {
        id_detalle_orden_acopio: Number(id_detalle),
        cantidad_enviada: Number(cantidad),
        codigo_producto_enviado: String(codigo),
        usuario_rut: String(rutUsuario),
        numero_pallet: Number(numero_pallet),
      };

      await createEnvioDetalleOrdenAcopio({
        variables,
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
    setEditValue(detalle.envios?.[0]?.cantidad_enviada?.toString() || "");
    setEditPalletValue(
      detalle.envios?.[0]?.pallet?.numero_pallet?.toString() || ""
    );
  };

  const handleSaveEdit = async (
    detalleId: number,
    envioId: number,
    cantidad_enviada: number
  ) => {
    cantidad_enviada = parseFloat(Number(cantidad_enviada).toFixed(2));
    const detalle = currentItems.find((d) => d.id === detalleId);
    const cantidadSolicitada = detalle?.producto.cantidad ?? 0;
    const numeroPalletActual = detalle?.envios?.[0]?.pallet?.numero_pallet;

    if (!editValue || isNaN(Number(editValue))) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad no es válida");
      setShowAlert(true);
      return;
    }

    const cantidad = Number(editValue);
    const numeroPallet = Number(editPalletValue);

    if (
      cantidad > 0 &&
      (!editPalletValue ||
        isNaN(Number(editPalletValue)) ||
        Number(editPalletValue) <= 0)
    ) {
      setAlertType("advertencia");
      setAlertMessage(
        "El número de pallet no es válido cuando la cantidad es mayor a 0"
      );
      setShowAlert(true);
      return;
    }

    if (cantidad === cantidad_enviada && numeroPallet === numeroPalletActual) {
      setAlertType("advertencia");
      setAlertMessage("No hay cambios para guardar");
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
      // Construir el objeto de entrada solo con los campos que han cambiado
      const updateInput: any = {
        id: envioId,
        cantidad: cantidad,
      };

      // Solo incluir numero_pallet si es diferente al actual
      if (numeroPallet !== numeroPalletActual) {
        updateInput.numero_pallet = numeroPallet;
      }

      await updateCantidadEnvioDetalle({
        variables: {
          updateEnvioDetalleOrdenAcopioInput: updateInput,
        },
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
    setEditPalletValue("");
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
  const handleDropdownDividirEnvioClick = (id: number) => {
    setDropdownDividirEnvioOpen(dropdownDividirEnvioOpen === id ? null : id);
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
  const handleConfirmarAcopio = async (id: number) => {
    setDesactivacionBoton(true);
    try {
      await updateEstadoOrdenAcopio({
        variables: {
          id,
          estado: "Subir",
        },
      });
      setAlertType("exitoso");
      setAlertMessage("Acopio confirmado exitosamente");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/salida/acopio_productos";
      }, 2000);
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al confirmar el acopio: " + error);
      setShowAlert(true);
    } finally {
      setDesactivacionBoton(false);
    }
  };
  const handleAcopioParcial = async (id: number) => {
    setDesactivacionBoton(true);
    try {
      await updateEstadoOrdenAcopio({
        variables: {
          id,
          estado: "Parcial",
        },
      });
      setAlertType("exitoso");
      setAlertMessage("Acopio parcial confirmado exitosamente");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/salida/carga_softland";
      }, 2000);
    } catch (error) {
      setAlertType("error");
      setAlertMessage("Error al confirmar el acopio parcial: " + error);
      setShowAlert(true);
    } finally {
      setDesactivacionBoton(false);
    }
  };

  // Función helper para verificar si un pallet está cerrado
  const isPalletCerrado = (detalle: DetalleOrdenAcopio): boolean => {
    return !!detalle.envios?.some(
      (envio) => envio.pallet?.estado === "Cerrado"
    );
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-10">
        <div className="bg-white p-6 rounded shadow">
          <h1>Cargando detalles del acopio...</h1>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-10">
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
      {showCargando && (
        <Cargando
          isOpen={showCargando}
          mensaje={"Confirmando Acopio..."}
          onClose={() => setShowCargando(false)}
        />
      )}
      {showSelectorPallets && (
        <ModalSelectorPallets
          isOpen={showSelectorPallets}
          onClose={() => setShowSelectorPallets(false)}
          id_orden_acopio={data.ordenAcopio.id}
        />
      )}
      {showModalAdicional && (
        <ModalAdicional
          isOpen={showModalAdicional}
          onClose={() => setShowModalAdicional(false)}
          id_orden_acopio={data.ordenAcopio.id}
          onProductCreated={() => {
            stableRefetch();
          }}
        />
      )}
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {data.ordenAcopio.estado === "Confirmacion" &&
        rolUsuario != "Bodeguero" ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Detalles Orden de Acopio</h2>
            <button
              className="bg-orange-400 text-white font-semibold px-4 py-2 rounded transition duration-200 hover:bg-orange-500"
              onClick={() => {
                handleConfirmarAcopio(data.ordenAcopio.id);
                setShowCargando(true);
              }}
            >
              Confirmar Acopio de Productos
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <div className="text-xl sm:text-2xl font-semibold">
              Detalle de Acopio N°{id_acopio}
            </div>
            <div className="flex gap-2">
              {rolUsuario != "Bodeguero" && (
                <button
                  className="bg-orange-400 text-white font-semibold px-4 py-2 rounded transition duration-200 hover:bg-orange-500"
                  onClick={() => {
                    setShowSelectorPallets(true);
                  }}
                >
                  Acopio Parcial
                </button>
              )}
              <button
                className={`bg-gray-400 text-white font-semibold px-4 py-2 rounded transition duration-200 ${
                  desactivacionBoton
                    ? "bg-gray-400 cursor-not-allowed "
                    : "hover:bg-gray-500"
                }`}
                onClick={() =>
                  (window.location.href = "/salida/acopio_productos")
                }
                disabled={desactivacionBoton}
              >
                Salir
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Centro de Costo</p>
                <p className="font-semibold text-gray-800">
                  {data?.ordenAcopio.centro_costo ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Fecha Despacho</p>
                <p className="font-semibold text-gray-800">
                  {data?.ordenAcopio.fecha_despacho ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Estado del Acopio</p>
                <p className="font-semibold text-gray-800">
                  {data?.ordenAcopio.estado ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtro de familias y búsqueda */}
        <div className="mt-4 mb-2 flex justify-between items-center">
          <div className="w-full">
            <FamilyFilter
              familyGroups={familyGroups}
              selectedFamilies={selectedFamilies}
              onFamilyChange={setSelectedFamilies}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Filtrar por familias..."
              searchPlaceholder="Buscar por código o descripción del producto..."
              disabled={desactivacionBoton}
              showSearch={true}
            />
          </div>
          <div className="w-full sm:w-80 ml-0 sm:ml-4 mt-4 sm:mt-0">
            {/* Reemplazo del select por PalletFilter */}
            <PalletFilter
              palletGroups={palletGroups}
              selectedPallet={selectedPallet}
              onPalletChange={setSelectedPallet}
              disabled={desactivacionBoton}
              placeholder="Todos los pallets"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200 ">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Código
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Unidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Solicitada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Enviada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Pallet
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
                    className={(() => {
                      const cantidadSolicitada = detalle.cantidad ?? 0;
                      const cantidadEnviada =
                        detalle.envios?.reduce(
                          (sum, e) => sum + (e.cantidad_enviada ?? 0),
                          0
                        ) ?? 0;
                      const tieneEnvios = (detalle.envios?.length ?? 0) > 0;
                      const palletCerrado = detalle.envios?.some(
                        (e) => e.pallet?.estado === "Cerrado"
                      );

                      let rowClass = "";
                      if (tieneEnvios && cantidadEnviada === 0)
                        rowClass = "bg-red-100 border-l-4 border-red-500";
                      else if (
                        tieneEnvios &&
                        cantidadEnviada < cantidadSolicitada
                      )
                        rowClass = "bg-blue-100 border-l-4 border-blue-400";
                      else if (palletCerrado)
                        rowClass = "bg-gray-200 border-l-4 border-gray-500";
                      else if (tieneEnvios)
                        rowClass = "bg-orange-100 border-l-4 border-orange-500";
                      return rowClass;
                    })()}
                  >
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.familia_planilla}
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

                    {detalle.envios?.length === 0 ? (
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
                          <input
                            type="number"
                            min={1}
                            value={numerosPallet[detalle.id] || ""}
                            onChange={(e) =>
                              handleCambioNumeroPallet(
                                detalle.id,
                                e.target.value ? Number(e.target.value) : 0
                              )
                            }
                            className="w-full border border-gray-300 rounded p-1"
                            disabled={desactivacionBoton}
                          />
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <div className="flex flex-col gap-2 sm:flex-row">
                            {!detalle.producto.trazabilidad &&
                              cantidadesTemporales[detalle.id] !== undefined &&
                              cantidadesTemporales[detalle.id] >= 0 && (
                                <button
                                  onClick={() => handleEnvioUnico(detalle.id)}
                                  className={`w-full text-white font-semibold py-2 px-2 rounded transition duration-200 ${
                                    desactivacionBoton ||
                                    loadingSave === detalle.id
                                      ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                      : "bg-blue-400 hover:bg-blue-500"
                                  }`}
                                  disabled={
                                    desactivacionBoton ||
                                    loadingSave === detalle.id
                                  }
                                >
                                  Enviar
                                </button>
                              )}
                            <button
                              onClick={() => {
                                handleDropdownCambiarProductoClick(detalle.id);
                                setLoadingSave(detalle.id);
                              }}
                              className={`w-full text-white font-semibold py-2 px-2 rounded transition duration-200 ${
                                loadingSave === detalle.id
                                  ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                  : "bg-orange-400 hover:bg-orange-500"
                              }`}
                            >
                              Cambiar Producto
                            </button>
                            <button
                              onClick={() => {
                                handleDropdownDividirEnvioClick(detalle.id);
                                setLoadingSave(detalle.id);
                              }}
                              className={`w-full text-white font-semibold py-2 px-2 rounded transition duration-200 ${
                                loadingSave === detalle.id
                                  ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                  : "bg-gray-400 hover:bg-gray-500"
                              }`}
                            >
                              Dividir Envío
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (detalle.envios?.length ?? 0) > 1 ? (
                      <>
                        <td
                          className="border border-gray-300 px-2 sm:px-4 py-2"
                          colSpan={3}
                        >
                          <button
                            onClick={() => {
                              handleDropdownEnviosClick(detalle.id);
                              setLoadingSave(detalle.id);
                            }}
                            className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                              loadingSave === detalle.id
                                ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                : "bg-orange-400 hover:bg-orange-500"
                            }`}
                            disabled={loadingSave === detalle.id}
                          >
                            Ver Envíos
                          </button>
                        </td>
                      </>
                    ) : detalle.codigo_producto !==
                      detalle.envios?.[0]?.codigo_producto_enviado ? (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold">
                          {detalle.envios?.[0]?.cantidad_enviada || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold">
                          {detalle.envios?.[0]?.pallet?.numero_pallet || "X"}
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
                            Ver Envío
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {editingId === detalle.id ? (
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-20 border border-gray-300 rounded p-1"
                              placeholder="Cantidad"
                            />
                          ) : (
                            detalle.envios[0]?.cantidad_enviada || "N/A"
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {editingId === detalle.id ? (
                            <input
                              type="number"
                              value={editPalletValue}
                              onChange={(e) =>
                                setEditPalletValue(e.target.value)
                              }
                              className="w-20 border border-gray-300 rounded p-1"
                              placeholder="Pallet"
                            />
                          ) : (
                            <span className="font-semibold">
                              {detalle.envios[0]?.pallet?.numero_pallet ||
                                "N/A"}
                            </span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {editingId === detalle.id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleSaveEdit(
                                    detalle.id,
                                    detalle.envios?.[0]?.id || 0,
                                    detalle.envios?.[0]?.cantidad_enviada || 0
                                  )
                                }
                                disabled={editLoading === detalle.id}
                                className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                                  editLoading === detalle.id
                                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                    : "bg-blue-400 hover:bg-blue-500"
                                }`}
                              >
                                Guardar
                              </button>
                              <button
                                disabled={editLoading === detalle.id}
                                onClick={handleCancelEdit}
                                className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                                  editLoading === detalle.id
                                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                    : "bg-red-500 hover:bg-red-600"
                                }`}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : isPalletCerrado(detalle) ? (
                            // Mostrar solo el botón de dividir envío
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => {
                                  handleDropdownDividirEnvioClick(detalle.id);
                                  setLoadingSave(detalle.id);
                                }}
                                className={`w-full text-white font-semibold py-2 px-2 rounded transition duration-200 ${
                                  loadingSave === detalle.id
                                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                    : "bg-gray-400 hover:bg-gray-500"
                                }`}
                              >
                                Dividir Envío
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {detalle.envios[0].cantidad_enviada != 0 && (
                                <button
                                  onClick={() => handleEditClick(detalle)}
                                  className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                                    loadingSave === detalle.id
                                      ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                      : "bg-orange-400 hover:bg-orange-500"
                                  }`}
                                  disabled={loadingSave === detalle.id}
                                >
                                  Editar
                                </button>
                              )}

                              <button
                                className={`font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                                  loadingSave === detalle.id
                                    ? "bg-gray-400 cursor-not-allowed text-white"
                                    : "bg-red-500 hover:bg-red-600 text-white"
                                }`}
                                onClick={() => {
                                  setShowConfirmacion(true);
                                  setIdEnvioEliminar(
                                    detalle.envios?.[0]?.id || 0
                                  );
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
                        colSpan={8}
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
                        colSpan={8}
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
                        colSpan={8}
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
                  {dropdownDividirEnvioOpen === detalle.id && (
                    <tr>
                      <td
                        colSpan={8}
                        className="border-0 p-2 sm:p-4 bg-gray-100"
                      >
                        <DropdownDividirEnvio
                          onClose={() => {
                            setDropdownDividirEnvioOpen(null);
                            setLoadingSave(null);
                          }}
                          onProductoEnviado={stableRefetch}
                          id_detalle_orden_acopio={detalle.id}
                          cantidad_solicitada={detalle.cantidad}
                          producto={detalle.producto}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end mt-4">
            <button
              className="bg-orange-400 text-white font-semibold px-4 py-2 rounded transition duration-200 hover:bg-orange-500"
              onClick={() => setShowModalAdicional(true)}
            >
              Agregar Producto Adicional
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
