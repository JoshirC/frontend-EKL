"use client";
import React, { useState, use } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  ConsolidadoPorIdResponseSSSR,
  ProductoConsolidado,
} from "@/types/graphql";
import { CONSOLIDADO_SS_SR_BY_ID } from "@/graphql/query";
import {
  ENVIAR_CORREO_CONSOLIDADO_SS_SR,
  CAMBIAR_ESTADO_ORDENES_ACOPIO_CONSOLIDADO,
  UPDATE_ESTADO_COMPRA_ORDEN_ACOPIO,
} from "@/graphql/mutations";
import { ordenarProductos } from "@/utils/ordenarProductosConsolidados";
import FamilyPagination from "@/components/FamilyPagination";
import Alert from "@/components/Alert";
import Cargando from "@/components/cargando";
import Confirmacion from "@/components/confirmacion";
import DropdownCambioProductoCompra from "@/components/consolidado/dropdownCambioProductoCompra";

interface ss_page_Props {
  params: Promise<{ tipo: string; id: string }>;
}
export default function SsPage({ params }: ss_page_Props) {
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [id_detalle, setIdDetalle] = useState<number | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);
  const [mensajeCargando, setMensajeCargando] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [mostrarCentros, setMostrarCentros] = useState<boolean>(false);
  const [dropdownCambiarProductoOpen, setDropdownCambiarProductoOpen] =
    useState(false);
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<ProductoConsolidado | null>(null);
  const { id } = use(params);
  const { loading, error, data, refetch } = useQuery(CONSOLIDADO_SS_SR_BY_ID, {
    variables: { id: parseInt(id, 10) },
  });
  const [enviarCorreoConsolidado] = useMutation(
    ENVIAR_CORREO_CONSOLIDADO_SS_SR,
    {
      onCompleted: () => {
        setCargando(false);
        setAlertType("exitoso");
        setAlertMessage("Correo enviado exitosamente");
        setShowAlert(true);
      },
      onError: (error) => {
        setCargando(false);
        setAlertMessage(error.message);
        setAlertType("error");
        setShowAlert(true);
      },
    }
  );
  const [cambiarEstadoOrdenesAcopio] = useMutation(
    CAMBIAR_ESTADO_ORDENES_ACOPIO_CONSOLIDADO,
    {
      onCompleted: () => {
        setCargando(false);
        setAlertType("exitoso");
        setAlertMessage("Consolidado listo para Acopiar");
        setShowAlert(true);
        setTimeout(() => {
          window.location.href = "/adquisiciones/consolidado";
        }, 1000);
      },
      onError: (error) => {
        setCargando(false);
        setAlertMessage(error.message);
        setAlertType("error");
        setShowAlert(true);
      },
    }
  );
  const [actualizarEstadoCompra] = useMutation(
    UPDATE_ESTADO_COMPRA_ORDEN_ACOPIO,
    {
      onCompleted: () => {
        setCargando(false);
        setAlertType("exitoso");
        setAlertMessage("Estado de compra actualizado");
        setShowAlert(true);
        refetch();
      },
      onError: (error) => {
        setCargando(false);
        setAlertMessage(error.message);
        setAlertType("error");
        setShowAlert(true);
      },
    }
  );
  // estados para filtros
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const consolidado: ConsolidadoPorIdResponseSSSR | null =
    data?.consolidadoPorId ?? null;

  if (!consolidado) return <p>No se encontró el consolidado</p>;

  // familias únicas para el filtro
  const familyGroups: string[] =
    consolidado.productos.length > 0
      ? (
          Array.from(
            new Set(
              consolidado.productos
                .map((prod) => prod.familia)
                .filter((f) => f && f.trim() !== "")
            )
          ) as string[]
        ).sort()
      : [];

  // productos filtrados (derivados, sin useEffect)
  const productosFiltrados = ordenarProductos(consolidado.productos)
    .filter((prod) => {
      const matchesSearch =
        prod.codigo_producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.descripcion_producto
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFamily =
        selectedFamilies.length === 0 ||
        selectedFamilies.includes(prod.familia);

      return matchesSearch && matchesFamily;
    })
    .sort((a, b) => {
      // Ordenar productos con estado_compra true al final
      if (a.estado_compra === b.estado_compra) return 0;
      return a.estado_compra ? 1 : -1;
    });

  const handleEnviarCorreo = () => {
    if (id != null) {
      enviarCorreoConsolidado({
        variables: { id_consolidado: parseInt(id, 10) },
      });
      setMensajeCargando("Enviando correo, por favor espere...");
      setCargando(true);
    }
  };
  const handleCambiarEstado = () => {
    if (id != null) {
      cambiarEstadoOrdenesAcopio({
        variables: { id: parseInt(id, 10), nuevoEstado: "Pendiente" },
      });
      setMensajeCargando("Enviando a Acopio, por favor espere...");
      setCargando(true);
    }
  };
  const handleProductoComprado = (id: number) => {
    if (id != null) {
      actualizarEstadoCompra({
        variables: { id: id },
      });
    }
  };

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Consolidado N°{id} de Solicitud Semanal - Solicitud de Reposición
          </div>
          <div className="space-x-2">
            <button
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded"
              onClick={handleEnviarCorreo}
              disabled={cargando}
            >
              Enviar por Correo
            </button>
            <button
              className="bg-blue-400 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded"
              onClick={handleCambiarEstado}
            >
              Completar Compra
            </button>
          </div>
        </div>
        {showAlert && (
          <Alert
            type={alertType}
            message={alertMessage}
            onClose={() => setShowAlert(false)}
          />
        )}
        {cargando && (
          <Cargando
            isOpen={cargando}
            mensaje={mensajeCargando}
            onClose={() => setCargando(false)}
          />
        )}
        {showConfirmacion && (
          <Confirmacion
            isOpen={showConfirmacion}
            titulo="Desconfirmar Compra"
            mensaje="¿Estás seguro de que deseas marcar este producto como no comprado?"
            onConfirm={() => {
              handleProductoComprado(id_detalle!);
              setShowConfirmacion(false);
            }}
            onClose={() => setShowConfirmacion(false)}
          />
        )}

        {/* Info del consolidado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Estado</p>
            <p className="font-semibold text-gray-800">
              {consolidado.estado || "N/A"}
            </p>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Fecha Inicio</p>
            <p className="font-semibold text-gray-800">
              {consolidado.fecha_inicio || "N/A"}
            </p>
          </div>
          <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm">
            <p className="text-sm font-medium">Fecha Término</p>
            <p className="font-semibold text-gray-800">
              {consolidado.fecha_termino || "N/A"}
            </p>
          </div>
        </div>

        {/* Controles de filtro */}
        {consolidado.productos.length > 0 && (
          <div className="mt-4 pb-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <FamilyPagination
              familyGroups={familyGroups}
              selectedFamilies={selectedFamilies}
              onFamilyChange={setSelectedFamilies}
              disabled={loading}
              placeholder="Filtrar por familia"
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Buscar por código o descripción..."
              showSearch={true}
            />
            <button
              className="bg-orange-400 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded text-sm text-center"
              onClick={() => setMostrarCentros(!mostrarCentros)}
            >
              {mostrarCentros ? "Ocultar" : "Mostrar"} Centros
            </button>
          </div>
        )}

        {/* Tabla de detalles */}
        <div className="overflow-x-auto mt-4">
          {productosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500">
              No se encontraron productos que coincidan con los filtros
              aplicados
            </p>
          ) : (
            <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm sm:text-base">
              <thead className="bg-gray-200">
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

                  {/* Cabeceras dinámicas por centro */}
                  {mostrarCentros &&
                    consolidado.centrosUnicos.map((centro) => (
                      <th
                        key={centro}
                        className="border border-gray-300 px-2 sm:px-4 py-2"
                      >
                        {centro}
                      </th>
                    ))}

                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Total
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Stock Actual
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Stock Pendiente
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Compra Recomendada
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
                {productosFiltrados.map((prod) => (
                  <React.Fragment key={prod.codigo_producto}>
                    <tr
                      key={prod.codigo_producto}
                      className={`hover:bg-gray-100 transition-colors ${
                        prod.estado_compra
                          ? "bg-orange-100 border-l-4 border-orange-500"
                          : ""
                      }`}
                    >
                      <td className="border border-gray-300 px-2 py-1 text-left">
                        {prod.familia}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-left">
                        {prod.codigo_producto}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-left">
                        {prod.descripcion_producto}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {prod.unidad}
                      </td>

                      {/* Cantidades por centro */}
                      {mostrarCentros &&
                        consolidado.centrosUnicos.map((centro) => {
                          const centroData = prod.centros?.find(
                            (c) => c.centro === centro
                          );
                          return (
                            <td
                              key={centro}
                              className="border border-gray-300 px-2 py-1"
                            >
                              {centroData ? centroData.cantidad : ""}
                            </td>
                          );
                        })}

                      <td className="border border-gray-300 px-2 py-1 text-orange-500">
                        {prod.total}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {prod.stock_actual}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {prod.stock_oc}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {parseInt(prod.compra_recomendada) > 0
                          ? prod.compra_recomendada
                          : 0}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        <div className="flex items-center justify-center">
                          <button
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => {
                              if (prod.estado_compra) {
                                setIdDetalle(prod.id_detalle);
                                setShowConfirmacion(true);
                              } else {
                                handleProductoComprado(prod.id_detalle);
                              }
                            }}
                          >
                            {prod.estado_compra ? (
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                            ) : (
                              <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-gray-400"></div>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {mostrarCentros ? (
                          <button className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-2 rounded w-full font-semibold text-sm">
                            Editar Cantidades
                          </button>
                        ) : (
                          <button
                            className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-2 rounded w-full font-semibold text-sm"
                            onClick={() => {
                              setIdDetalle(prod.id_detalle);
                              setProductoSeleccionado({
                                id_detalle: prod.id_detalle,
                                familia: prod.familia,
                                codigo_producto: prod.codigo_producto,
                                descripcion_producto: prod.descripcion_producto,
                                unidad: prod.unidad,
                              });
                              setDropdownCambiarProductoOpen(true);
                            }}
                          >
                            Cambiar Producto
                          </button>
                        )}
                      </td>
                    </tr>
                    {dropdownCambiarProductoOpen &&
                      id_detalle === prod.id_detalle && (
                        <tr>
                          <td
                            colSpan={
                              mostrarCentros
                                ? 12 + consolidado.centrosUnicos.length
                                : 12
                            }
                            className="border-0 p-2 sm:p-4 bg-gray-100"
                          >
                            <DropdownCambioProductoCompra
                              id_consolidado={parseFloat(id)}
                              producto_seleccionado={productoSeleccionado}
                              onClose={() =>
                                setDropdownCambiarProductoOpen(false)
                              }
                              onProductoChange={() => {
                                refetch();
                                setIdDetalle(null);
                                setProductoSeleccionado(null);
                              }}
                            />
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
