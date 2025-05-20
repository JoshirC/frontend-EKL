"use client";
import React, { useState, useEffect } from "react";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
type DetalleOrdenCompra = {
  codigo_producto: string;
  nombre_producto: string;
  cantidad: number;
  precio_unitario: number;
  valor_total: number;
};
const OrdenCompraPage: React.FC = () => {
  // Estado para almacenar el número de orden de compra
  const [ordenCompra, setOrdenCompra] = useState<string>("");
  // Estado para almacenar los detalles de la orden de compra
  const [detalles, setDetalles] = useState<DetalleOrdenCompra[]>([]);
  // Estado para almacenar el índice del detalle que se está editando
  const [indexEditar, setIndexEditar] = useState<number>(-1);
  const [indexEliminar, setIndexEliminar] = useState<number>(-1);
  // Estado para almacenar el mensaje de alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  // estado para mensaje de confirmación
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const fetchOrdenCompra = async () => {
    if (!ordenCompra) {
      setAlertType("advertencia");
      setAlertMessage("Por favor, ingrese un número de orden de compra.");
      setShowAlert(true);
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/orden-compra/${ordenCompra}/`
      );
      if (!response.ok) {
        setAlertType("error");
        setAlertMessage("No se encontró la orden de compra.");
        setShowAlert(true);
        return;
      }
      detalles.length = 0;

      const data = await response.json();
      setDetalles(data);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(
        "Error al obtener la orden de compra. Detalles: " + error
      );
      setShowAlert(true);
    }
  };
  const handleEliminarProducto = (index: number) => {
    const nuevaLista = [...detalles];
    nuevaLista.splice(index, 1);
    setDetalles(nuevaLista);
  };
  const handleEditarDetalles = (
    index: number,
    campo: keyof DetalleOrdenCompra,
    valor: number
  ) => {
    const nuevaLista: DetalleOrdenCompra[] = [...detalles];
    nuevaLista[index][campo] = valor as never;
    nuevaLista[index].valor_total =
      nuevaLista[index].cantidad * nuevaLista[index].precio_unitario;
    setDetalles(nuevaLista);
  };
  const handleConfirmacion = (confirmacion: boolean) => {
    if (confirmacion) {
      handleEliminarProducto(indexEliminar);
    }
    setShowConfirmacion(false);
    setIndexEliminar(-1);
  };
  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
          cerrar={true}
        />
      )}
      {showConfirmacion && (
        <Confirmacion
          isOpen={showConfirmacion}
          titulo="Eliminar Producto"
          mensaje={`¿Estás seguro de que deseas eliminar a este producto?`}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      <div className="bg-white shadow rounded p-6">
        {/* Titulo */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl font-semibold">Orden de Compra</h1>
          {detalles.length > 0 && (
            <button className="bg-orange-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-orange-500 transition duration-300 w-full sm:w-auto whitespace-nowrap">
              Terminar Orden de Compra
            </button>
          )}
        </div>
        {/* Buscador y Botón */}
        <div className=" flex flex-col sm:flex-row gap-4 mt-4">
          <input
            type="text"
            id="ordenCompra"
            className="w-full p-4 border border-gray-300 rounded-md"
            placeholder="Ingrese el número de la orden de compra a buscar"
            onChange={(e) => setOrdenCompra(e.target.value)}
          />

          <button
            type="submit"
            className="bg-gray-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-gray-500 transition duration-300 w-full sm:w-auto whitespace-nowrap"
            onClick={fetchOrdenCompra}
          >
            Buscar
          </button>
        </div>
        {/* Tabla de Contenidos */}
        {detalles.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Código Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Nombre Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Cantidad
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Precio Unitario
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Valor Total
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {detalles.map((detalle, index) => (
                  <tr key={index} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.codigo_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.nombre_producto}
                    </td>

                    {/* Validación si el editar esta activo en dicha fila */}
                    {indexEditar == index ? (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={detalle.cantidad}
                            onChange={(e) =>
                              handleEditarDetalles(
                                index,
                                "cantidad",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={detalle.precio_unitario}
                            onChange={(e) =>
                              handleEditarDetalles(
                                index,
                                "precio_unitario",
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {detalle.cantidad}
                        </td>
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          $ {detalle.precio_unitario}
                        </td>
                      </>
                    )}
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      $ {detalle.valor_total}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <div className="flex flex-row gap-2 justify-center">
                        <button
                          className={`text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap ${
                            indexEditar == index
                              ? "bg-blue-400 hover:bg-blue-500"
                              : "bg-orange-400 hover:bg-orange-500"
                          }`}
                          onClick={() =>
                            indexEditar == index
                              ? setIndexEditar(-1)
                              : setIndexEditar(index)
                          }
                        >
                          {indexEditar == index ? "Guardar" : "Editar"}
                        </button>
                        <button
                          className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-red-400 hover:bg-red-500 "
                          onClick={() => {
                            setShowConfirmacion(true);
                            setIndexEliminar(index);
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenCompraPage;
