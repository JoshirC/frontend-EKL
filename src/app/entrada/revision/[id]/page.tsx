"use client";
import React, { useState, useEffect } from "react";
import { GET_GUIA_ENTRADA_BY_ID } from "@/graphql/query";
import {
  UPDATE_GUIA_ENTRADA,
  UPDATE_GUIA_ENTRADA_DETALLE_CANTIDAD_Y_PRECIO,
} from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import { formatDateToDDMMYYYY } from "@/utils/dataUtils";
type Producto = {
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
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
  codigo_centro_costo: string;
  numero_factura: number;
  fecha_factura: string;
  numero_orden_compra: string;
  estado: string;
  guiaEntradaDetalle: GuiaEntradaDetalle[];
};

type FormErrors = {
  codigoBodega?: string;
  numeroFolio?: string;
  codigoProveedor?: string;
  codigoCentroCosto?: string;
  numeroFactura?: string;
  fechaFactura?: string;
};

export default function GuiaEntradaIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);
  const id_num = parseInt(id);
  const [botonCargando, setBotonCargando] = useState(false);
  // Estados del formulario
  const [formData, setFormData] = useState({
    codigoBodega: "",
    numeroFolio: 0,
    codigoProveedor: "",
    codigoCentroCosto: "",
    numeroFactura: 0,
    fechaFactura: "",
  });
  // Estados para la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  // Estados para la validación del formulario
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);

  const [indexEditar, setIndexEditar] = useState<number | null>(null);
  const [editedDetalles, setEditedDetalles] = useState<
    Record<number, Partial<GuiaEntradaDetalle>>
  >({});

  const { loading, error, data, refetch } = useQuery(GET_GUIA_ENTRADA_BY_ID, {
    variables: { id: id_num },
  });

  const [updateGuiaEntrada] = useMutation(UPDATE_GUIA_ENTRADA, {
    onCompleted: () => {
      setShowAlert(true);
      setAlertType("exitoso");
      setAlertMessage("Guía de entrada confirmada");
      setTimeout(() => {
        setShowAlert(false);
        window.location.href = "/entrada/revision";
      }, 3000);
    },
    onError: (error) => {
      setShowAlert(true);
      setAlertType("error");
      setAlertMessage(`Error al confirmar guía de entrada: ${error.message}`);
    },
  });
  const [updateDetalleCantidadYPrecio] = useMutation(
    UPDATE_GUIA_ENTRADA_DETALLE_CANTIDAD_Y_PRECIO,
    {
      onCompleted: () => {
        setShowAlert(true);
        setAlertType("exitoso");
        setAlertMessage("Producto actualizados correctamente");
        refetch();
      },
      onError: (error) => {
        setShowAlert(true);
        setAlertType("error");
        setAlertMessage(`Error al actualizar el detalle: ${error.message}`);
      },
    }
  );
  useEffect(() => {
    if (data?.guiaEntrada) {
      const guia = data.guiaEntrada;
      setFormData({
        codigoBodega: guia.codigo_bodega || "",
        numeroFolio: guia.numero_folio || 0,
        codigoProveedor: guia.codigo_proveedor || "",
        codigoCentroCosto: guia.codigo_centro_costo || "",
        numeroFactura: guia.numero_factura || 0,
        fechaFactura: guia.fecha_factura || "",
      });
    }
  }, [data]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("numero") ||
        name.includes("Folio") ||
        name.includes("Factura")
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fechaFactura: formatDateToDDMMYYYY(value),
    }));
  };
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.codigoBodega || formData.codigoBodega === "N/A")
      newErrors.codigoBodega = "Código de bodega es requerido";
    if (formData.numeroFolio <= 0)
      newErrors.numeroFolio = "Número de folio debe ser mayor a 0";
    if (formData.codigoProveedor === "N/A" || !formData.codigoProveedor)
      newErrors.codigoProveedor = "Proveedor es requerido";
    if (formData.codigoCentroCosto === "N/A" || !formData.codigoCentroCosto)
      newErrors.codigoCentroCosto = "Centro de costo es requerido";
    if (formData.numeroFactura <= 0)
      newErrors.numeroFactura = "Número de factura debe ser mayor a 0";
    if (formData.fechaFactura === "N/A" || !formData.fechaFactura)
      newErrors.fechaFactura = "Fecha de factura es requerida";

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const updatedGuiaEntrada = {
        id: id_num,
        codigo_bodega: formData.codigoBodega,
        numero_folio: formData.numeroFolio,
        codigo_proveedor: formData.codigoProveedor,
        codigo_centro_costo: formData.codigoCentroCosto,
        numero_factura: formData.numeroFactura,
        fecha_factura: formData.fechaFactura,
        estado: "Subir",
      };

      updateGuiaEntrada({
        variables: { updateGuiaEntradaInput: updatedGuiaEntrada },
      });
    }
  };
  const handleEditarDetalle = (
    idDetalle: number,
    cantidad: number,
    precio: number
  ) => {
    if (cantidad <= 0 || precio <= 0) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage("Cantidad y precio deben ser mayores a 0");
      return;
    }
    try {
      updateDetalleCantidadYPrecio({
        variables: {
          id_guia_entrada_detalle: idDetalle,
          cantidad: Math.round(cantidad),
          precio: Math.round(precio),
        },
      });
      setEditedDetalles((prev) => {
        const copy = { ...prev };
        delete copy[idDetalle];
        return copy;
      });

      setIndexEditar(null);
    } catch (error) {
      setShowAlert(true);
      setAlertType("error");
      setAlertMessage(`Error al guardar cambios: ${error}`);
    }
  };

  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow animate-pulse">
          <p className="text-gray-700">Cargando guía de entrada...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow border-l-4 border-red-500">
          <p className="text-red-600 font-medium">
            Error al cargar guía de entrada:
          </p>
          <p className="text-gray-700 mt-2">{error.message}</p>
        </div>
      </div>
    );

  const guiaEntrada: GuiaEntrada = data?.guiaEntrada || {};

  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Guía de Entrada N°{id_num}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleSubmit(
                  new Event(
                    "submit"
                  ) as unknown as React.FormEvent<HTMLFormElement>
                );
                setBotonCargando(true);
              }}
              className={`w-full sm:w-auto font-semibold p-3 rounded transition-colors duration-200 shadow-sm ${
                botonCargando
                  ? "bg-gray-400 text-gray-500 cursor-not-allowed"
                  : isFormValid
                  ? "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!isFormValid || botonCargando}
              type="submit"
            >
              Confirmar Guía de Entrada
            </button>
            <button
              onClick={() => {
                window.location.href = "/entrada/revision";
                setBotonCargando(true);
              }}
              className={`w-full sm:w-auto font-semibold p-3 rounded transition-colors duration-200 shadow-sm ${
                botonCargando
                  ? "bg-gray-400 text-gray-500 cursor-not-allowed"
                  : "bg-gray-400 hover:bg-gray-500 text-white"
              }`}
              type="button"
              disabled={botonCargando}
            >
              Lista de guías
            </button>
          </div>
        </div>
        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Información de la Guía
            </h2>
            <p className="text-gray-500 mb-3">
              Completa o modifica los detalles de la guía de entrada. Todos los
              campos son requeridos.
            </p>

            {/* Primera fila de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label
                  htmlFor="numeroFolio"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número de Folio *
                </label>
                <input
                  id="numeroFolio"
                  name="numeroFolio"
                  type="number"
                  min="1"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.numeroFolio ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.numeroFolio}
                />
              </div>

              <div>
                <label
                  htmlFor="codigoProveedor"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  RUT Proveedor *
                </label>
                <input
                  id="codigoProveedor"
                  name="codigoProveedor"
                  type="text"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.codigoProveedor
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.codigoProveedor}
                />
              </div>

              <div>
                <label
                  htmlFor="codigoCentroCosto"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código Centro de Costo *
                </label>
                <input
                  id="codigoCentroCosto"
                  name="codigoCentroCosto"
                  type="text"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.codigoCentroCosto
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.codigoCentroCosto}
                />
              </div>
            </div>

            {/* Segunda fila de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label
                  htmlFor="numeroFactura"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Número de Factura *
                </label>
                <input
                  id="numeroFactura"
                  name="numeroFactura"
                  type="number"
                  min="1"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.numeroFactura ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.numeroFactura}
                />
              </div>

              <div>
                <label
                  htmlFor="fechaFactura"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Fecha de Factura *
                </label>
                <input
                  id="fechaFactura"
                  name="fechaFactura"
                  value={formData.fechaFactura}
                  type="date"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.fechaFactura ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label
                  htmlFor="codigoBodega"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código de Bodega *
                </label>
                <input
                  id="codigoBodega"
                  name="codigoBodega"
                  type="text"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.codigoBodega ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.codigoBodega}
                />
              </div>
            </div>
          </div>
        </form>
        {/* Tabla de productos */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Productos de la Guía
        </h2>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Ingresada
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio Unitario
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Total
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {guiaEntrada.guiaEntradaDetalle?.map((detalle) => {
                const isEditing = indexEditar === detalle.id;
                const edited = editedDetalles[detalle.id] || {};

                return (
                  <tr key={detalle.id}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto.nombre_producto}
                    </td>

                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          className="p-2 w-full border rounded"
                          value={
                            edited.cantidad_ingresada ??
                            detalle.cantidad_ingresada
                          }
                          onChange={(e) =>
                            setEditedDetalles((prev) => ({
                              ...prev,
                              [detalle.id]: {
                                ...prev[detalle.id],
                                cantidad_ingresada: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                      ) : (
                        detalle.cantidad_ingresada
                      )}
                    </td>

                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          className="p-2 w-full border rounded"
                          value={
                            edited.precio_unitario ?? detalle.precio_unitario
                          }
                          onChange={(e) =>
                            setEditedDetalles((prev) => ({
                              ...prev,
                              [detalle.id]: {
                                ...prev[detalle.id],
                                precio_unitario: parseFloat(e.target.value),
                              },
                            }))
                          }
                        />
                      ) : (
                        `$ ${detalle.precio_unitario}`
                      )}
                    </td>

                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      $
                      {(
                        (edited.cantidad_ingresada ??
                          detalle.cantidad_ingresada) *
                        (edited.precio_unitario ?? detalle.precio_unitario)
                      ).toLocaleString("es-CL", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </td>

                    <td className="border border-gray-300 px-2 sm:px-4 sm:py-2">
                      <div className="flex flex-row gap-2">
                        {isEditing ? (
                          <>
                            <button
                              className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-blue-400 hover:bg-blue-500"
                              onClick={() => {
                                handleEditarDetalle(
                                  detalle.id,
                                  edited.cantidad_ingresada ??
                                    detalle.cantidad_ingresada,
                                  edited.precio_unitario ??
                                    detalle.precio_unitario
                                );
                              }}
                            >
                              Guardar
                            </button>
                            <button
                              className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-red-400 hover:bg-red-500"
                              onClick={() => {
                                setIndexEditar(null);
                                setEditedDetalles((prev) => {
                                  const copy = { ...prev };
                                  delete copy[detalle.id];
                                  return copy;
                                });
                              }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-blue-400 hover:bg-blue-500"
                              onClick={() => setIndexEditar(detalle.id)}
                            >
                              Editar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
