"use client";
import React, { useState, DragEvent, ChangeEvent } from "react";
import Alert from "../Alert";

interface ModalConsolidarProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: "SS" | "CL" | "SM" | "SR ES";
}

const ModalConsolidar: React.FC<ModalConsolidarProps> = ({
  isOpen,
  onClose,
  tipo,
}) => {
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [typeAlert, setTypeAlert] = useState<"exitoso" | "error">("exitoso");

  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const handleConsolidarSS_SR = async () => {
    if (!fechaInicio || !fechaFin) {
      setAlertMessage("Debes seleccionar fecha de inicio y término.");
      setTypeAlert("error");
      setShowAlert(true);
      return;
    }

    if (files.length === 0) {
      setAlertMessage("Debes seleccionar al menos un archivo Excel.");
      setTypeAlert("error");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fecha_inicio", fechaInicio);
      formData.append("fecha_termino", fechaFin);
      formData.append("tipo_archivo", tipo); // SS, CL, SM, SR ES
      files.forEach((f) => {
        formData.append("files", f);
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_API}/excel/upload-ss-sr-art/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      setAlertMessage("Consolidación realizada con éxito.");
      setTypeAlert("exitoso");
      setShowAlert(true);
      // Limpiar estados
      setFechaInicio("");
      setFechaFin("");
      setFiles([]);
      setTimeout(() => {
        setShowAlert(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAlertMessage("Error al consolidar. " + (error as Error).message);
      setTypeAlert("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };
  const handleConsolidarCL = async () => {
    if (!fechaInicio || !fechaFin) {
      setAlertMessage("Debes seleccionar fecha de inicio y término.");
      setTypeAlert("error");
      setShowAlert(true);
      return;
    }

    if (files.length === 0) {
      setAlertMessage("Debes seleccionar al menos un archivo Excel.");
      setTypeAlert("error");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fecha_inicio", fechaInicio);
      formData.append("fecha_termino", fechaFin);
      files.forEach((f) => {
        formData.append("files", f);
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_API}/excel/upload-solicitud-cl/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      setAlertMessage("Consolidación realizada con éxito.");
      setTypeAlert("exitoso");
      setShowAlert(true);
      // Limpiar estados
      setFechaInicio("");
      setFechaFin("");
      setFiles([]);
      setTimeout(() => {
        setShowAlert(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAlertMessage("Error al consolidar. " + (error as Error).message);
      setTypeAlert("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };
  const handleCSubirSM = async () => {
    if (!fechaInicio || !fechaFin) {
      setAlertMessage("Debes seleccionar fecha de inicio y término.");
      setTypeAlert("error");
      setShowAlert(true);
      return;
    }

    if (files.length === 0) {
      setAlertMessage("Debes seleccionar al menos un archivo Excel.");
      setTypeAlert("error");
      setShowAlert(true);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fecha_inicio", fechaInicio);
      formData.append("fecha_termino", fechaFin);
      files.forEach((f) => {
        formData.append("files", f);
      });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_PYTHON_API}/excel/upload-solicitud-sm/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      setAlertMessage("Consolidación realizada con éxito.");
      setTypeAlert("exitoso");
      setShowAlert(true);
      // Limpiar estados
      setFechaInicio("");
      setFechaFin("");
      setFiles([]);
      setTimeout(() => {
        setShowAlert(false);
        onClose();
      }, 2000);
    } catch (error) {
      setAlertMessage("Error al consolidar. " + (error as Error).message);
      setTypeAlert("error");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Nueva función manejadora
  const handleConsolidar = () => {
    if (tipo === "SS" || tipo === "SR ES") {
      handleConsolidarSS_SR();
    } else if (tipo === "CL") {
      handleConsolidarCL();
    } else if (tipo === "SM") {
      handleCSubirSM();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-8 max-h-[70vh] overflow-y-auto relative">
        {/* Botón cerrar */}
        <button
          onClick={() => {
            onClose();
            setFechaFin("");
            setFechaInicio("");
            setFiles([]);
          }}
          className="absolute top-3 right-6 text-gray-400 hover:text-red-500 text-3xl font-bold"
        >
          ×
        </button>

        {/* Título */}
        {tipo === "SM" && (
          <h1 className="text-2xl font-semibold text-center mb-3">
            Ingresar Solicitud Mensual
          </h1>
        )}
        {(tipo === "SS" || tipo === "CL" || tipo === "SR ES") && (
          <h1 className="text-2xl font-semibold text-center mb-3">
            Consolidar {tipo}
          </h1>
        )}

        {/* Alert */}
        {showAlert && alertMessage && (
          <Alert
            message={alertMessage}
            type={typeAlert}
            modal={true}
            onClose={() => setShowAlert(false)}
          />
        )}
        {/* Fechas */}
        <h1 className="text-lg font-semibold mb-2">Selección de Fechas</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha término
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-orange-400 focus:outline-none"
            />
          </div>
        </div>
        <h1 className="text-lg font-semibold mb-2">Subida de Archivos</h1>
        {/* Recuadro para subir archivos */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
            dragging
              ? "border-orange-500 bg-orange-50"
              : "border-gray-300 hover:border-orange-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          <input
            id="fileInput"
            type="file"
            accept=".xls,.xlsx"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          {files.length > 0 ? (
            <ul className="text-gray-800 space-y-1">
              {files.map((f, idx) => (
                <li key={idx} className="text-sm">
                  {f.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">
              Arrastra tus archivos Excel aquí o haz click para seleccionarlos.
            </p>
          )}
        </div>

        {/* Botón acción */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleConsolidar}
            disabled={loading}
            className={`px-6 py-2 rounded text-white font-semibold w-full ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-400 hover:bg-orange-500"
            }`}
          >
            {loading ? "Consolidando..." : "Consolidar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalConsolidar;
