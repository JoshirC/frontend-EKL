import React, { useEffect } from "react";

interface AlertProps {
  type: "exitoso" | "error" | "advertencia";
  message: string;
  onClose?: () => void;
  modal?: boolean;
  cerrar?: boolean; // Nuevo parámetro opcional
}

const Alert: React.FC<AlertProps> = ({
  type,
  message,
  onClose,
  modal = false,
  cerrar = false, // Valor por defecto
}) => {
  useEffect(() => {
    // Configurar el temporizador para cerrar la alerta automáticamente si 'cerrar' es true
    if (cerrar) {
      const timer = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 3000); // 3s

      // Limpiar el temporizador cuando el componente se desmonte
      return () => clearTimeout(timer);
    }
  }, [cerrar, onClose]);

  const getAlertStyles = () => {
    switch (type) {
      case "exitoso":
        return "text-blue-800 border-t-4 border-blue-300 bg-blue-50";
      case "error":
        return "text-red-800 border-t-4 border-red-300 bg-red-50";
      case "advertencia":
        return "text-yellow-800 border-t-4 border-yellow-300 bg-yellow-50";
      default:
        return "text-gray-800 border-t-4 border-gray-300 bg-gray-50";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "exitoso":
        return (
          <svg
            className="shrink-0 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        );
      case "error":
        return (
          <svg
            className="shrink-0 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        );
      case "advertencia":
        return (
          <svg
            className="shrink-0 w-4 h-4"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (modal) {
    return (
      <div
        className={`flex items-center p-4 mb-4 ${getAlertStyles()}`}
        role="alert"
      >
        {getIcon()}
        <div className="ms-3 text-sm font-medium">{message}</div>
        {onClose && (
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-opacity-20"
            onClick={handleClose}
            aria-label="Close"
          >
            <span className="sr-only">Cerrar</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Versión no modal (como la original)
  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/60"
      onClick={handleClose}
    >
      <div
        className={`relative flex items-center p-4 w-full max-w-md mx-auto rounded-lg shadow-lg ${getAlertStyles()}`}
        role="alert"
        onClick={(e) => e.stopPropagation()}
      >
        {getIcon()}
        <div className="ms-3 text-sm font-medium">{message}</div>
        {onClose && (
          <button
            type="button"
            className="ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 p-1.5 inline-flex items-center justify-center h-8 w-8 hover:bg-opacity-20"
            onClick={handleClose}
            aria-label="Close"
          >
            <span className="sr-only">Cerrar</span>
            <svg
              className="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
