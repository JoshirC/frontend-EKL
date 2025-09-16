"use client";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_TRAZABILIDAD_BY_CODIGO_PRODUCTO } from "@/graphql/query";
import {
  CREATE_ENVIO_DETALLE_ORDEN_ACOPIO,
  UPDATE_ESTADO_DETALLE_ACOPIO,
} from "@/graphql/mutations";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "../Alert";
interface DropdownTrazabilidadProps {
  id_detalle_orden_acopio: number;
  codigo_producto: string;
  isOpen: boolean;
  onClose: () => void;
  onTrazabilidadCompleta?: () => void;
}
type Trazabilidad = {
  id: number;
  numero_lote: string;
  cantidad_producto: number;
  fecha_elaboracion: string;
  fecha_vencimiento: string;
  temperatura: number;
  observaciones: string;
  fecha_registro: string;
  codigo_proveedor: string;
  numero_factura: string;
  usuario: {
    id: number;
    nombre: string;
    rut: string;
  };
  producto: {
    id: number;
    codigo: string;
    nombre_producto: string;
  };
};
const DropdownTrazabilidad: React.FC<DropdownTrazabilidadProps> = ({
  id_detalle_orden_acopio,
  codigo_producto,
  isOpen,
  onClose,
  onTrazabilidadCompleta,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const { loading, error, data } = useQuery(
    GET_TRAZABILIDAD_BY_CODIGO_PRODUCTO,
    {
      variables: { codigo_producto },
    }
  );

  // Estados para cantidad, alerta y loading
  const [cantidades, setCantidades] = useState<Record<number, number>>({});
  const [numerosPallet, setNumerosPallet] = useState<Record<number, number>>(
    {}
  );
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [enviados, setEnviados] = useState<number[]>([]);
  const { rutUsuario } = useJwtStore();

  const [createEnvioDetalleOrdenAcopio] = useMutation(
    CREATE_ENVIO_DETALLE_ORDEN_ACOPIO
  );
  const [updateEstadoEnviado] = useMutation(UPDATE_ESTADO_DETALLE_ACOPIO);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) return null;
  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <h1>Cargando...</h1>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded flex justify-between items-center">
        <span>{error.message}</span>
        <button
          className="ml-4 text-red-700 font-bold text-lg hover:text-red-900"
          onClick={onClose}
          aria-label="Cerrar"
        >
          x
        </button>
      </div>
    );
  }
  const trazabilidad: Trazabilidad[] = data.trazabilidadByCodigoProducto;

  // Manejar cambio de cantidad
  const handleCambioCantidad = (id: number, valor: number) => {
    setCantidades((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  // Manejar cambio de número de pallet
  const handleCambioNumeroPallet = (id: number, valor: number) => {
    setNumerosPallet((prev) => ({
      ...prev,
      [id]: valor,
    }));
  };

  // Manejar envío
  const handleEnviar = async (item: Trazabilidad) => {
    const cantidadEnviada = cantidades[item.id] || 0;
    const numeroPallet = numerosPallet[item.id] || 0;

    if (cantidadEnviada <= 0) {
      setAlertType("advertencia");
      setAlertMessage("La cantidad enviada debe ser mayor a 0");
      setShowAlert(true);
      return;
    }

    if (numeroPallet <= 0) {
      setAlertType("advertencia");
      setAlertMessage("Debe ingresar un número de pallet válido");
      setShowAlert(true);
      return;
    }

    setLoadingState(true);
    try {
      await createEnvioDetalleOrdenAcopio({
        variables: {
          id_detalle_orden_acopio,
          cantidad_enviada: cantidadEnviada,
          codigo_producto_enviado: item.producto.codigo,
          usuario_rut: rutUsuario,
          numero_pallet: numeroPallet,
          id_trazabilidad: item.id,
        },
      });
      await updateEstadoEnviado({
        variables: { id: id_detalle_orden_acopio },
      });
      setEnviados((prev) => [...prev, item.id]);
      setAlertType("exitoso");
      setAlertMessage("Producto enviado correctamente");
      setShowAlert(true);
    } catch (error: any) {
      setAlertType("error");
      setAlertMessage("Error al enviar el producto: " + error.message);
      setShowAlert(true);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded shadow-lg py-3 sm:py-4 px-4 sm:px-8 m-1">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          modal={true}
        />
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
        <h2 className="text-base font-semibold sm:text-lg">Trazabilidad</h2>
        <button
          className="bg-gray-500 text-white font-semibold px-4 py-2 rounded hover:bg-gray-600 transition duration-200"
          onClick={() => {
            onClose();
            onTrazabilidadCompleta && onTrazabilidadCompleta();
          }}
        >
          Cerrar
        </button>
      </div>
      <div className="">
        {trazabilidad.length > 0 ? (
          [...trazabilidad]
            .sort(
              (a, b) =>
                new Date(a.fecha_vencimiento).getTime() -
                new Date(b.fecha_vencimiento).getTime()
            )
            .map((item) => {
              const fueEnviado = enviados.includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border rounded-lg mt-4 gap-2 sm:gap-4 border-gray-200 hover:bg-gray-50 ${
                    fueEnviado ? "bg-gray-100 border-gray-500" : ""
                  }`}
                >
                  {/* Mostrar información del producto */}
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <p>
                      <strong>ID Trazabilidad:</strong> {item.id}
                    </p>
                    <p>
                      <strong>Número de Lote:</strong> {item.numero_lote}
                    </p>
                    <p>
                      <strong>Cantidad Producto:</strong>{" "}
                      {item.cantidad_producto}
                    </p>
                    <p>
                      <strong>Fecha Vencimiento:</strong>{" "}
                      {item.fecha_vencimiento}
                    </p>
                  </div>
                  {/* Botones e Input */}
                  {!fueEnviado ? (
                    <div className="flex flex-col justify-end  sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
                      <input
                        type="number"
                        min="1"
                        value={cantidades[item.id] || ""}
                        className="w-20  border border-gray-300 rounded p-2 text-sm sm:text-base"
                        placeholder={item.cantidad_producto.toString()}
                        onChange={(e) =>
                          handleCambioCantidad(item.id, Number(e.target.value))
                        }
                        disabled={loadingState}
                      />
                      <input
                        type="number"
                        min="1"
                        value={numerosPallet[item.id] || ""}
                        className="w-24 border border-gray-300 rounded p-2 text-sm sm:text-base"
                        placeholder="Nº Pallet"
                        onChange={(e) =>
                          handleCambioNumeroPallet(
                            item.id,
                            Number(e.target.value)
                          )
                        }
                        disabled={loadingState}
                      />
                      <button
                        className={`bg-blue-500 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto ${
                          loadingState ? "opacity-50" : "hover:bg-blue-600"
                        } transition duration-200`}
                        onClick={() => handleEnviar(item)}
                        disabled={loadingState}
                      >
                        {loadingState ? "Enviando..." : "Guardar"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm sm:text-base">
                      Producto ya enviado
                    </div>
                  )}
                </div>
              );
            })
        ) : (
          <p>No hay trazabilidad disponible para este producto.</p>
        )}
      </div>
    </div>
  );
};
export default DropdownTrazabilidad;
