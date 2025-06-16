"use client";
import React, { useState, useEffect } from "react";
import Alert from "@/components/Alert";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCargaCompleta?: () => void;
}

const NuevaOrdenAcopio: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onCargaCompleta,
}) => {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false); // <- Estado para loading
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleClose = () => {
    setArchivo(null);
    onClose();
    onCargaCompleta && onCargaCompleta();
  };

  const handleUpload = async () => {
    if (!archivo) {
      setAlertType("error");
      setAlertMessage("Por favor selecciona un archivo antes de subir.");
      setShowAlert(true);
      return;
    }

    const formData = new FormData();
    formData.append("file", archivo);

    try {
      setIsUploading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/upload-excel/`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        setAlertType("error");
        setAlertMessage("Error al subir el archivo");
        setShowAlert(true);
        return;
      }

      const data = await response.json();
      if (data.error) {
        setAlertType("error");
        setAlertMessage(data.error);
        setShowAlert(true);
        return;
      }
      setAlertType("exitoso");
      setAlertMessage("Archivo subido exitosamente.");
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        handleClose();
      }, 2000); // Ocultar la alerta después de 2 segundos
    } catch (error: any) {
      setAlertType("error");
      setAlertMessage(error.message || "Ocurrió un error inesperado.");
      setShowAlert(true);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 sm:px-4 px-12">
          <div className="bg-white opacity-100 w-full max-w-md rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Orden de Acopio
            </h1>
            <h2 className="text-sm mb-4 text-center">
              Ingresa un archivo de Excel con los datos del consolidado.
            </h2>
            {showAlert && (
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                modal={true}
              />
            )}
            <input
              type="file"
              accept=".xlsx, .xls"
              className="block w-full mt-4 text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:font-semibold file:bg-amber-400 file:text-white hover:file:bg-amber-500 file:cursor-pointer border border-gray-300 rounded"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setArchivo(e.target.files[0]);
                }
              }}
            />

            {/* Botón para subir archivo */}
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-orange-400 text-white font-bold py-2 px-4 rounded hover:bg-orange-500 transition duration-300 w-full mt-4"
            >
              {isUploading ? "Subiendo..." : "Subir Archivo"}
            </button>
            {/* Botón para cerrar */}
            <button
              onClick={handleClose}
              className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300 w-full mt-6"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NuevaOrdenAcopio;
