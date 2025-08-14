"use client";
import React, { useState, use, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import DropdownCambioProducto from "@/components/salida_acopio/DropdownCambioProducto";
import DropdownEnviosDetalleOrdenAcopio from "@/components/salida_acopio/dropdownEnviosDetalleOrdenAcopio";
import DropdownTrazabilidad from "@/components/salida_acopio/dropdownTrazabilidad";
import FamilyFilter from "@/components/FamilyPagination";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_CANTIDAD_ENVIO_DETALLE,
  REMOVE_ENVIO_DETALLE_ORDEN_ACOPIO,
  CREATE_MULTIPLE_ENVIOS_DETALLE,
  UPDATE_ESTADO_ORDEN_ACOPIO,
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
  pallet: Pallet;
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
type Pallet = {
  id: number;
  numero_pallet: number;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [editPalletValue, setEditPalletValue] = useState<string>("");
  const [editLoading, setEditLoading] = useState<number | null>(null);
  const [loadingSave, setLoadingSave] = useState<number | null>(null);
  const [familyGroups, setFamilyGroups] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
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

    // Filtrar por familias seleccionadas
    let filteredItems: DetalleOrdenAcopio[] = [];
    if (selectedFamilies.length > 0) {
      selectedFamilies.forEach((familia) => {
        if (grouped[familia]) {
          filteredItems = filteredItems.concat(grouped[familia]);
        }
      });
    } else {
      // Si no hay familias seleccionadas, mostrar todos los items
      filteredItems = detalles;
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filteredItems = filteredItems.filter(
        (detalle) =>
          detalle.codigo_producto
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          detalle.producto.nombre_producto
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Crear una copia del array y ordenar productos: primero por estado de envío, luego alfabéticamente
    const sortedItems = [...filteredItems].sort((a, b) => {
      // Determinar si los productos fueron enviados
      const aEnviado = a.envios.length > 0;
      const bEnviado = b.envios.length > 0;

      // Si uno está enviado y el otro no, el no enviado va primero
      if (aEnviado && !bEnviado) return 1;
      if (!aEnviado && bEnviado) return -1;

      // Si ambos tienen el mismo estado de envío, ordenar alfabéticamente por nombre del producto
      return a.producto.nombre_producto.localeCompare(
        b.producto.nombre_producto,
        "es",
        { sensitivity: "base" }
      );
    });

    return {
      groupedByFamily: grouped,
      currentItems: sortedItems,
    };
  }, [data, selectedFamilies, searchTerm]);

  // Refetch simplificado
  const stableRefetch = async () => {
    await refetch();
  };

  // Mutaciones

  const [createManyEnvios] = useMutation(CREATE_MULTIPLE_ENVIOS_DETALLE, {
    onCompleted: (data) =>
      handleEnvioMasivoCompleted(data, () => {
        setCantidadesTemporales({});
        setNumerosPallet({});
      }),
    onError: (error) => {
      setAlertType("error");
      setAlertMessage("Error general al enviar productos: " + error.message);
      setShowAlert(true);
    },
  });

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
      console.error("Error en envío único:", error);
      setDesactivacionBoton(false);
    }
  };
  const handleCrearEnviosMasivos = async () => {
    // Productos con cantidad válida (>= 0)
    const productosConCantidad = currentItems.filter(
      (d) =>
        !d.producto.trazabilidad &&
        cantidadesTemporales[d.id] !== undefined &&
        cantidadesTemporales[d.id] !== null &&
        cantidadesTemporales[d.id] >= 0
    );

    if (productosConCantidad.length === 0) {
      setAlertType("advertencia");
      setAlertMessage(
        "Debe ingresar una cantidad válida para al menos un producto."
      );
      setShowAlert(true);
      return;
    }

    // Validar que productos con cantidad > 0 tengan número de pallet
    const productosSinPallet = productosConCantidad.filter(
      (d) =>
        cantidadesTemporales[d.id] > 0 &&
        (numerosPallet[d.id] === undefined ||
          numerosPallet[d.id] === null ||
          numerosPallet[d.id] <= 0)
    );

    if (productosSinPallet.length > 0) {
      setAlertType("advertencia");
      setAlertMessage(
        "Los productos con cantidad mayor a 0 deben tener un número de pallet válido."
      );
      setShowAlert(true);
      return;
    }

    const productosFiltrados = productosConCantidad.map((d) => {
      const objeto = {
        id_detalle_orden_acopio: d.id,
        cantidad_enviada: Number(cantidadesTemporales[d.id]),
        codigo_producto_enviado: d.codigo_producto,
      };

      // Solo agregar numero_pallet si la cantidad es mayor a 0
      if (cantidadesTemporales[d.id] > 0) {
        (objeto as any).numero_pallet = Number(numerosPallet[d.id]);
      }

      return objeto;
    });

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
    setEditValue(detalle.envios[0]?.cantidad_enviada?.toString() || "");
    setEditPalletValue(
      detalle.envios[0]?.pallet?.numero_pallet?.toString() || ""
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
    const numeroPalletActual = detalle?.envios[0]?.pallet?.numero_pallet;

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
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {data.ordenAcopio.estado === "Confirmacion" &&
        rolUsuario != "Bodeguero" ? (
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Detalles Orden de Acopio</h2>
            <button
              className="bg-orange-400 text-white font-semibold px-4 py-2 rounded transition duration-200 hover:bg-orange-500"
              onClick={() => handleConfirmarAcopio(data.ordenAcopio.id)}
            >
              Confirmar Acopio de Productos
            </button>
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Centro de Costo</p>
                <p className="font-semibold text-gray-800">
                  {data?.ordenAcopio.centroCosto ?? "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium">Fecha Despacho</p>
                <p className="font-semibold text-gray-800">
                  {data?.ordenAcopio.fechaDespacho ?? "N/A"}
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
        <div className="mt-4 mb-2">
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

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200 ">
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
                  Número Pallet
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
                                  className={`w-full text-white font-semibold py-2 px-2 rounded transition duration-200
    ${
      desactivacionBoton || loadingSave === detalle.id
        ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
        : "bg-blue-400 hover:bg-blue-500"
    }
  `}
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
                          </div>
                        </td>
                      </>
                    ) : detalle.envios.length > 1 ? (
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
                      </>
                    ) : detalle.codigo_producto !==
                      detalle.envios[0].codigo_producto_enviado ? (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold">
                          {detalle.envios[0]?.cantidad_enviada || "N/A"}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2 font-semibold">
                          {detalle.envios[0]?.pallet?.numero_pallet || "N/A"}
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
                                    detalle.envios[0].id,
                                    detalle.envios[0].cantidad_enviada
                                  )
                                }
                                disabled={editLoading === detalle.id}
                                className={`text-white font-semibold py-2 px-4 rounded transition duration-200 w-full ${
                                  editLoading === detalle.id
                                    ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                                    : "bg-blue-400 hover:bg-blue-500"
                                }
  `}
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
              Enviar Múltiples Productos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
