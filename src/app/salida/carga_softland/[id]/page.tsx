"use client";
import React, { useState, useEffect, use } from "react";
import Barcode from "react-barcode";
import { GET_GUIA_SALIDA_CON_FOLIO } from "@/graphql/query";
import { UPDATE_GUIA_SALIDA } from "@/graphql/mutations";
import { useQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";

type Envio = {
  id: number;
  codigo_producto_enviado: string;
  cantidad_enviada: number;
  producto: {
    nombre_producto: string;
    codigo: string;
    familia: string;
    unidad_medida: string;
    precio_unitario: number;
  };
};
type GuiaSalida = {
  id: number;
  envios: Envio[];
};
type FormErrors = {
  codigoBodega?: string;
  numeroFolio?: number;
  concepto?: string;
  codigoCliente?: string;
  codigoCentroCosto?: string;
  usuario?: string;
  valorTotal?: number;
  fechaGenneracion?: string;
};

export default function CargaSoftlandDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: id_salida } = use(params);
  const id_salida_num = parseFloat(id_salida);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormErrors>({
    codigoBodega: "",
    numeroFolio: 0,
    concepto: "",
    codigoCliente: "",
    codigoCentroCosto: "",
    usuario: "",
    valorTotal: 0,
    fechaGenneracion: "",
  });
  // Componente para mostrar la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [cerrarModal, setCerrarModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Estado de la confirmacion
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.codigoBodega || formData.codigoBodega.trim() === "") {
      errors.codigoBodega = "El código de bodega es requerido.";
    }
    if (!formData.numeroFolio || formData.numeroFolio <= 0) {
      errors.numeroFolio = 0;
    }
    if (!formData.concepto || formData.concepto.trim() === "") {
      errors.concepto = "El concepto es requerido.";
    }
    if (!formData.codigoCliente || formData.codigoCliente.trim() === "") {
      errors.codigoCliente = "El código del cliente es requerido.";
    }
    if (!formData.codigoCentroCosto || formData.codigoCentroCosto === "") {
      errors.codigoCentroCosto = "El código del centro de costo es requerido.";
    }
    if (!formData.usuario || formData.usuario.trim() === "") {
      errors.usuario = "El usuario es requerido.";
    }
    if (
      formData.valorTotal === undefined ||
      formData.valorTotal === null ||
      isNaN(formData.valorTotal)
    ) {
      errors.valorTotal = 0;
    }
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  const { loading, error, data } = useQuery(GET_GUIA_SALIDA_CON_FOLIO, {
    variables: { id: id_salida_num },
  });

  const [updateGuiaSalida] = useMutation(UPDATE_GUIA_SALIDA, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("Guía de salida actualizada correctamente.");
      setShowAlert(true);
      setTimeout(() => {
        window.location.href = "/salida/carga_softland";
      }, 3000); // Ocultar alerta después de 3 segundos
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(
        `Error al actualizar la guía de salida: ${error.message}`
      );
      setShowAlert(true);
    },
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();
    if (!isFormValid) {
      setAlertType("error");
      setAlertMessage("Por favor, complete todos los campos requeridos.");
      setShowAlert(true);
      return;
    }
  };
  const handleConfirmacion = () => {
    if (!isFormValid) {
      setAlertType("advertencia");
      setAlertMessage("Por favor, completa todos los campos requeridos.");
      setShowAlert(true);
      return;
    }
    const today = new Date();
    const fechaActual = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
    const updatedGuia = {
      id: id_salida_num,
      codigo_bodega: formData.codigoBodega,
      numero_folio: formData.numeroFolio,
      concepto_salida: formData.concepto,
      codigo_cliente: formData.codigoCliente,
      codigo_centro_costo: formData.codigoCentroCosto,
      fecha_generacion: fechaActual,
      usuario_creacion: formData.usuario,
      valor_total: formData.valorTotal,
    };

    updateGuiaSalida({
      variables: { updateGuiaSalidaInput: updatedGuia },
    });
    setShowConfirmacion(false);
  };

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

  useEffect(() => {
    validateForm();
  }, [formData]);
  // Si hay un último número de folio y el formData.numeroFolio es 0, actualiza el formData
  useEffect(() => {
    const guia = data?.obtenerGuiaSalidaConFolio?.guiaSalida;
    const ultimoFolio = data?.obtenerGuiaSalidaConFolio?.ultimoFolio;

    if (guia) {
      setFormData({
        codigoBodega: guia.codigo_bodega || "",
        numeroFolio:
          !guia.numero_folio || guia.numero_folio === 0
            ? ultimoFolio || 0
            : guia.numero_folio,
        concepto: guia.concepto_salida || "",
        codigoCliente: guia.codigo_cliente || "",
        codigoCentroCosto: guia.codigo_centro_costo || "",
        usuario: guia.usuario_creacion || "",
        valorTotal: guia.valor_total || 0,
        fechaGenneracion: guia.fecha_generacion || "",
      });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando detalles del acopio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p className="text-red-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const guiaSalida: GuiaSalida = data?.obtenerGuiaSalidaConFolio
    ?.guiaSalida || {
    id: 0,
    envios: [],
  };

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
      <div className="bg-white p-4 sm:p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="text-xl sm:text-2xl font-semibold">
            Detalle de Guia de Salida N°{id_salida}
          </div>
          <button
            className={`w-full sm:w-auto font-semibold p-3 rounded transition-colors duration-200 shadow-sm ${
              isFormValid
                ? "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
            onClick={() => {
              handleConfirmacion();
            }}
          >
            Actualizar Guia de Salida
          </button>
        </div>
        {/* Formulario de la Guia de Salida */}
        <form onSubmit={handleSubmit}>
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Información de la Guía
            </h2>
            <p className="text-gray-500 mb-3">
              Completa o modifica los detalles de la guía de Salida. Todos los
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
                <p
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.numeroFolio ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {formData.numeroFolio}
                </p>
              </div>

              <div>
                <label
                  htmlFor="codigoBodega"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Código Bodega *
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

              <div>
                <label
                  htmlFor="concepto"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Concepto de Salida *
                </label>
                <input
                  id="concepto"
                  name="concepto"
                  type="text"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.concepto ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.concepto}
                />
              </div>
            </div>

            {/* Segunda fila de campos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  type="string"
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.codigoCentroCosto
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  onChange={handleChange}
                  value={formData.codigoCentroCosto}
                />
              </div>

              <div>
                <label
                  htmlFor="valorTotal"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Valor Total *
                </label>
                <p
                  className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.valorTotal ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {formData.valorTotal || 0}
                </p>
              </div>
            </div>
          </div>
        </form>
        {/* Información de la guía de salida */}
        <h2 className="text-xl font-semibold text-gray-800 mb-3">
          Productos de la Guía
        </h2>
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción Producto
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Unidad de Medida
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio Unitario
                </th>
              </tr>
            </thead>
            <tbody>
              {guiaSalida.envios.map((envio) => (
                <tr key={envio.id}>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.codigo_producto_enviado}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.producto.nombre_producto}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.cantidad_enviada}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.producto.unidad_medida}
                  </td>
                  <td className="border border-gray-300 px-2 sm:px-4 py-2">
                    {envio.producto.precio_unitario}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
