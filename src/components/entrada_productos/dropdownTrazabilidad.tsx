"use client";
import React, { useEffect, useState } from "react";
import { CREATE_TRAZABILIDAD } from "@/graphql/mutations";
import { useMutation } from "@apollo/client";
import { formatDateToDDMMYYYY } from "@/utils/dataUtils";

interface DropdownTrazabilidadProps {
  isOpen: boolean;
  codigoProducto?: string;
  onClose: () => void;
  onTrazabilidadCompletado?: () => void;
}
type FormErrors = {
  numeroLote?: string;
  fechaElaboracion?: string;
  fechaVencimiento?: string;
  temperatura?: string;
  condicionEnvase?: string;
  observaciones?: string;
};

const DropdownTrazabilidad: React.FC<DropdownTrazabilidadProps> = ({
  isOpen,
  codigoProducto,
  onClose,
  onTrazabilidadCompletado,
}) => {
  if (!isOpen) return null;
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    numeroLote: "",
    fechaElaboracion: "",
    fechaVencimiento: "",
    temperatura: "",
    condicionEnvase: "",
    observaciones: "",
  });

  const [createTrazabilidad] = useMutation(CREATE_TRAZABILIDAD, {
    onCompleted: () => {
      onTrazabilidadCompletado?.();
      setFormData({
        numeroLote: "",
        fechaElaboracion: "",
        fechaVencimiento: "",
        temperatura: "",
        condicionEnvase: "",
        observaciones: "",
      });
      setErrors({});
    },
    onError: (error) => {
      console.error("Error al crear trazabilidad:", error);
    },
  });
  useEffect(() => {
    validateForm();
  }, [formData]);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: formatDateToDDMMYYYY(value),
    }));
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.numeroLote || formData.numeroLote === "") {
      errors.numeroLote = "El número de lote es obligatorio.";
    }
    if (!formData.fechaElaboracion || formData.fechaElaboracion === "") {
      errors.fechaElaboracion = "La fecha de elaboración es obligatoria.";
    }
    if (!formData.fechaVencimiento || formData.fechaVencimiento === "") {
      errors.fechaVencimiento = "La fecha de vencimiento es obligatoria.";
    }
    if (!formData.condicionEnvase || formData.condicionEnvase === "") {
      errors.condicionEnvase = "La condición del envase es obligatoria.";
    }
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      const input = {
        numero_lote: formData.numeroLote,
        fecha_elaboracion: formData.fechaElaboracion,
        fecha_vencimiento: formData.fechaVencimiento,
        temperatura: formData.temperatura,
        condicion_envasado: formData.condicionEnvase,
        observaciones: formData.observaciones,
        codigo_producto: codigoProducto || "",
      };
      createTrazabilidad({
        variables: { createTrazabilidadInput: input },
      }).catch((error) => {
        console.error("Error al crear trazabilidad:", error);
      });
    }
    onTrazabilidadCompletado?.();
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg px-10 py-6 m-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Formulario de Trazabilidad
        </h2>
        <div className="space-x-4">
          <button
            onClick={handleSubmit}
            className={`w-full sm:w-auto font-semibold py-3 px-6 rounded transition-colors duration-200 shadow-sm ${
              isFormValid
                ? "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isFormValid}
            type="submit"
          >
            Guardar
          </button>
          <button
            className="bg-gray-500 text-white font-semibold py-3 px-6 rounded hover:bg-gray-600 transition duration-200"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Primera fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="numeroLote"
              className="block text-start font-medium text-gray-700 mb-1 "
            >
              Número de Lote *
            </label>
            <input
              id="numeroLote"
              name="numeroLote"
              type="text"
              onChange={handleChange}
              required
              className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.numeroLote ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="fechaElaboracion"
              className="block text-start font-medium text-gray-700 mb-1"
            >
              Fecha de Elaboración *
            </label>
            <input
              id="fechaElaboracion"
              name="fechaElaboracion"
              type="date"
              onChange={handleDateChange}
              required
              className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fechaElaboracion ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* Segunda fila */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label
              htmlFor="fechaVencimiento"
              className="block text-start font-medium text-gray-700 mb-1"
            >
              Fecha de Vencimiento *
            </label>
            <input
              id="fechaVencimiento"
              name="fechaVencimiento"
              type="date"
              value={formData.fechaVencimiento}
              onChange={handleDateChange}
              required
              className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.fechaVencimiento ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          <div>
            <label
              htmlFor="temperatura"
              className="block text-start font-medium text-gray-700 mb-1"
            >
              Temperatura (°C)
            </label>
            <input
              id="temperatura"
              name="temperatura"
              type="text"
              value={formData.temperatura}
              onChange={handleChange}
              className="p-3 w-full border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tercera fila */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-6">
          <div>
            <label
              htmlFor="condicionEnvase"
              className="block text-start font-medium text-gray-700 mb-1"
            >
              Condición del Envase *
            </label>
            <select
              id="condicionEnvase"
              name="condicionEnvase"
              value={formData.condicionEnvase}
              onChange={handleChange}
              required
              className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.condicionEnvase ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione...</option>
              <option value="bueno">Bueno</option>
              <option value="regular">Regular</option>
              <option value="malo">Malo</option>
            </select>
          </div>
        </div>
        {/* Cuarta fila */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-6">
          <div>
            <label
              htmlFor="observaciones"
              className="block text-start font-medium text-gray-700 mb-1"
            >
              Observaciones
            </label>
            <textarea
              id="observaciones"
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              rows={3}
              className="p-3 w-full border rounded-lg shadow-sm border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DropdownTrazabilidad;
