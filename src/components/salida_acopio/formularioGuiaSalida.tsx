"use client";
import React, { useState, useEffect, use } from "react";
import { ACTUALIZAR_GUIAS_POR_ORDEN } from "@/graphql/mutations";
import { useMutation } from "@apollo/client";
import Alert from "@/components/Alert";

interface FormularioGuiaSalidaProps {
  id_orden: number;
}

type FormErrors = {
  codigoBodega?: string;
  concepto?: string;
  codigoCliente?: string;
  codigoCentroCosto?: string;
};

const FormularioGuiaSalida: React.FC<FormularioGuiaSalidaProps> = ({
  id_orden,
}) => {
  const [formData, setFormData] = useState<FormErrors>({
    codigoBodega: "",
    concepto: "",
    codigoCliente: "",
    codigoCentroCosto: "",
  });
  // Componente para mostrar la alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [cerrarModal, setCerrarModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);

  // Estado de la confirmacion
  const [loadingButtom, setLoadinButtom] = useState(false);
  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.codigoBodega || formData.codigoBodega.trim() === "") {
      errors.codigoBodega = "El código de bodega es requerido.";
    }
    if (!formData.concepto || formData.concepto.trim() === "") {
      errors.concepto = "El concepto es requerido.";
    }
    if (!formData.codigoCliente || formData.codigoCliente.trim() === "") {
      errors.codigoCliente = "El código del cliente es requerido.";
    }
    if (
      !formData.codigoCentroCosto ||
      formData.codigoCentroCosto.trim() === ""
    ) {
      errors.codigoCentroCosto = "El código del centro de costo es requerido.";
    }
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };
  const [updateGuiaSalida] = useMutation(ACTUALIZAR_GUIAS_POR_ORDEN, {
    onCompleted: () => {
      setAlertType("exitoso");
      setAlertMessage("Guía de salida actualizada correctamente.");
      setShowAlert(true);
      setLoadinButtom(false);
      setTimeout(() => {
        window.location.href = "/salida/revision";
      }, 2000);
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(
        `Error al actualizar la guía de salida: ${error.message}`
      );
      setShowAlert(true);
    },
  });
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
    updateGuiaSalida({
      variables: {
        input: {
          id_orden_acopio: id_orden,
          codigo_bodega: formData.codigoBodega,
          concepto: formData.concepto,
          codigo_cliente: formData.codigoCliente,
          codigo_centro_costo: formData.codigoCentroCosto,
        },
      },
    });
  };

  useEffect(() => {
    validateForm();
  }, [formData]);
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">Formulario Orden Acopio</h2>
        <button
          className={`w-full sm:w-auto font-semibold p-3 rounded transition-colors duration-200 shadow-sm ${
            isFormValid || loadingButtom
              ? "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!isFormValid || loadingButtom}
          onClick={() => {
            handleConfirmacion();
            setLoadinButtom(true);
          }}
        >
          Confirmar Orden de Acopio
        </button>
      </div>
      {/* Formulario de la Guia de Salida */}
      <form onSubmit={handleSubmit}>
        <div className="mb-8">
          <p className="text-gray-500 mb-3">
            Completa los detalles de Orden de Acopio. Todos los campos son
            requeridos.
          </p>

          {/* Primera fila de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label
                htmlFor="codigoBodega"
                className="block text-sm font-medium text-gray-700 mb-3"
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
                className="block text-sm font-medium text-gray-700 mb-3"
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
            <div>
              <label
                htmlFor="codigoCentroCosto"
                className="block text-sm font-medium text-gray-700 mb-3"
              >
                Código de Cliente *
              </label>
              <input
                id="codigoCliente"
                name="codigoCliente"
                type="string"
                className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.codigoCliente ? "border-red-500" : "border-gray-300"
                }`}
                onChange={handleChange}
                value={formData.codigoCliente}
              />
            </div>
            <div>
              <label
                htmlFor="codigoCentroCosto"
                className="block text-sm font-medium text-gray-700 mb-3"
              >
                Código Centro Costo *
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
        </div>
      </form>
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={cerrarModal}
        />
      )}
    </div>
  );
};

export default FormularioGuiaSalida;
