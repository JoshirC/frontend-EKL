import React, { useEffect, useState } from "react";
import CambiarProducto from "./cambiarProducto";
import { useMutation } from "@apollo/client";
import { CREATE_ENVIO_DETALLE_ORDEN_ACOPIO } from "@/graphql/mutations";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "../Alert";

interface DropdownDividirEnvioProps {
  onClose: () => void;
  onProductoEnviado?: () => void;
  id_detalle_orden_acopio: number;
  cantidad_solicitada: number;
  envios: Envio[];
  producto: Producto;
}
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
type Pallet = {
  id: number;
  numero_pallet: number;
  estado: string;
};
const DropdownDividirEnvio: React.FC<DropdownDividirEnvioProps> = ({
  onClose,
  onProductoEnviado,
  id_detalle_orden_acopio,
  cantidad_solicitada,
  envios,
  producto,
}) => {
  const [showCambiarProducto, setShowCambiarProducto] = useState(false);
  const [envioLines, setEnvioLines] = useState([{ cantidad: "", pallet: "" }]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const { rutUsuario } = useJwtStore();
  const [botonActivo, setBotonActivo] = useState<number | null>(null);
  const [enviosRealizados, setEnviosRealizados] = useState<
    {
      cantidad: number;
      pallet: number;
      codigo_producto: string;
      nombre_producto: string;
    }[]
  >([]);

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO
  );

  // Función para agregar una nueva línea
  const handleNuevoEnvio = () => {
    setEnvioLines([...envioLines, { cantidad: "", pallet: "" }]);
  };

  // Función para manejar cambios en los inputs
  const handleInputChange = (
    index: number,
    field: "cantidad" | "pallet",
    value: string
  ) => {
    const updatedLines = envioLines.map((line, i) =>
      i === index ? { ...line, [field]: value } : line
    );
    setEnvioLines(updatedLines);
  };

  // Función para crear el envío de una línea
  const handleGuardarEnvio = async (idx: number) => {
    const line = envioLines[idx];
    const cantidad = Number(line.cantidad);
    const pallet = Number(line.pallet);

    if (!cantidad || cantidad <= 0) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar una cantidad válida.");
      return;
    }
    if (!pallet || pallet <= 0) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar un número de pallet válido.");
      return;
    }
    if (cantidad > producto.cantidad) {
      setShowAlert(true);
      setAlertType("advertencia");
      setAlertMessage(
        `La cantidad a enviar (${cantidad}) no puede ser mayor a la cantidad disponible (${producto.cantidad}).`
      );
      return;
    }

    setBotonActivo(idx);

    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio,
          cantidad_enviada: cantidad,
          codigo_producto_enviado: producto.codigo,
          usuario_rut: rutUsuario,
          numero_pallet: pallet,
        },
      });

      // Guardar registro en enviosRealizados solo cuando es exitoso
      setEnviosRealizados((prev) => [
        ...prev,
        {
          cantidad,
          pallet,
          codigo_producto: producto.codigo,
          nombre_producto: producto.nombre_producto,
        },
      ]);

      // Mostrar alerta de éxito
      setShowAlert(true);
      setAlertType("exitoso");
      setAlertMessage("Envío creado exitosamente");

      // Limpiar la línea
      setEnvioLines((lines) =>
        lines.map((l, i) => (i === idx ? { cantidad: "", pallet: "" } : l))
      );
    } catch (error) {
      setShowAlert(true);
      setAlertType("error");
      setAlertMessage("Error al crear el envío");
    }

    setBotonActivo(null);
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg p-6">
      {showCambiarProducto && (
        <CambiarProducto
          isOpen={showCambiarProducto}
          onClose={() => setShowCambiarProducto(false)}
          id_detalle_orden_acopio={id_detalle_orden_acopio}
          producto={producto}
        />
      )}
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dividir Envío</h2>
          <p>Envía productos en diferentes pallets</p>
        </div>
        <button
          onClick={() => {
            onProductoEnviado?.();
            onClose();
          }}
          className="bg-gray-500 hover:bg-gray-600 text-white rounded font-semibold px-4 py-2"
        >
          Cerrar
        </button>
      </div>
      {/* Alert */}
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          modal={true}
        />
      )}
      {/* Contenido del Dropdown */}
      {envioLines.map((line, idx) => (
        <div
          key={idx}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-200"
        >
          <div>
            <p>
              <strong>Producto:</strong> {producto.nombre_producto}{" "}
              <strong>({producto.codigo})</strong> {producto.unidad_medida}
            </p>
            <p>
              <strong>Cantidad Solicitada:</strong> {cantidad_solicitada}
            </p>
          </div>
          <div className="space-x-3">
            <input
              type="number"
              min="1"
              max={producto.cantidad}
              placeholder={`${producto.cantidad}`}
              className="w-20 border border-gray-300 rounded p-2 text-sm"
              value={line.cantidad}
              onChange={(e) =>
                handleInputChange(idx, "cantidad", e.target.value)
              }
            />
            <input
              type="number"
              min="1"
              placeholder="Pallet"
              className="w-20 border border-gray-300 rounded p-2 text-sm"
              value={line.pallet}
              onChange={(e) => handleInputChange(idx, "pallet", e.target.value)}
            />
            <button
              className={`bg-blue-400 hover:bg-blue-500 text-white rounded font-semibold px-4 py-2 ${
                botonActivo === idx ? "opacity-60 cursor-wait" : ""
              }`}
              onClick={() => handleGuardarEnvio(idx)}
              disabled={botonActivo === idx}
            >
              {botonActivo === idx ? "Guardando..." : "Guardar"}
            </button>
            <button
              className="bg-orange-400 hover:bg-orange-500 text-white rounded font-semibold px-4 py-2"
              onClick={() => setShowCambiarProducto(true)}
            >
              Cambiar Producto
            </button>
          </div>
        </div>
      ))}
      {/* Mostrar envíos realizados */}
      {enviosRealizados.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">
            Envíos realizados
          </h3>
          <div className="space-y-2">
            {enviosRealizados.map((envio, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded px-4 py-2"
              >
                <div className="flex flex-col">
                  <span>
                    <strong>Producto:</strong> {envio.nombre_producto} (
                    {envio.codigo_producto})
                  </span>
                  <span className="text-sm text-gray-600">
                    <strong>Cantidad:</strong> {envio.cantidad} |{" "}
                    <strong>Pallet:</strong> {envio.pallet}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownDividirEnvio;
