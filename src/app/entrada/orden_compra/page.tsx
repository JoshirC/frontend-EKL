"use client";
import React, { useState, useEffect } from "react";
import { GET_ORDEN_COMPRA } from "@/graphql/query";
import { CREATE_PRODUCTO_SOFTLAND } from "@/graphql/mutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
import AgregarProductoOC from "@/components/entrada_productos/agregarProductoOC";
type DetalleOrdenCompra = {
  codigo: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  valor_total: number;
  producto: Producto | null;
};
type Producto = {
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  cantidad: number;
  cantidad_softland: number;
  trazabilidad: boolean;
};
const OrdenCompraPage: React.FC = () => {
  // Estado para almacenar el número de orden de compra
  const [ordenCompra, setOrdenCompra] = useState<string>("");
  // Estado para almacenar los detalles de la orden de compra
  const [detalles, setDetalles] = useState<DetalleOrdenCompra[]>([]);
  // Estado para almacenar el índice del detalle que se está editando
  const [indexEditar, setIndexEditar] = useState<number>(-1);
  const [indexEliminar, setIndexEliminar] = useState<number>(-1);
  const [indexCrearProducto, setIndexCrearProducto] = useState<number>(-1);
  // Estado para almacenar el mensaje de alerta
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  // estado para mensaje de confirmación
  const [showConfirmacionEliminar, setShowConfirmacionEliminar] =
    useState(false);
  const [showConfirmacionCrearProducto, setShowConfirmacionCrearProducto] =
    useState(false);
  // Estado para agregar un nuevo producto a la orden de compra
  const [mostrarAgregarProducto, setMostrarAgregarProducto] = useState(false);

  const [fetchOrdenCompra, { data, loading, error, refetch }] =
    useLazyQuery(GET_ORDEN_COMPRA);

  const [createProductoSoftland] = useMutation(CREATE_PRODUCTO_SOFTLAND, {
    onCompleted: (data) => {
      if (data.createProductoSoftland) {
        setAlertType("exitoso");
        setAlertMessage("Producto creado exitosamente.");
        setShowAlert(true);
        fetchOrdenCompra({
          variables: { codigo_orden_compra: ordenCompra },
        }).then((result) => {
          if (result.data?.ordenCompra) {
            setDetalles(result.data.ordenCompra);
          }
        });
      } else {
        setAlertType("error");
        setAlertMessage("Error al crear el producto.");
        setShowAlert(true);
      }
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(`Error: ${error.message}`);
      setShowAlert(true);
    },
  });

  const handleBuscarOrdenCompra = async () => {
    if (!ordenCompra) {
      setAlertType("advertencia");
      setAlertMessage("Por favor, ingrese un número de orden de compra.");
      setShowAlert(true);
      return;
    }
    try {
      const { data } = await fetchOrdenCompra({
        variables: { codigo_orden_compra: ordenCompra },
      });
      console.log(data);
      if (!data?.ordenCompra || data.ordenCompra.length === 0) {
        setAlertType("error");
        setAlertMessage("No se encontró la orden de compra.");
        setShowAlert(true);
        setDetalles([]);
      } else {
        setDetalles(data.ordenCompra);
      }
    } catch (err) {
      setAlertType("error");
      setAlertMessage("Error al obtener la orden de compra.");
      setShowAlert(true);
      setDetalles([]);
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
  const handleConfirmacionEliminar = (confirmacion: boolean) => {
    if (confirmacion) {
      handleEliminarProducto(indexEliminar);
    }
    setShowConfirmacionEliminar(false);
    setIndexEliminar(-1);
  };
  const handleConfirmacionCrearProducto = (confirmacion: boolean) => {
    if (confirmacion) {
      const codigoProducto = detalles[indexCrearProducto].codigo;
      try {
        createProductoSoftland({
          variables: { createProductoCode: codigoProducto },
        });
      } catch (error) {
        setAlertType("error");
        setAlertMessage("Error al crear el producto.");
        setShowAlert(true);
      }
    }
    setShowConfirmacionCrearProducto(false);
    setIndexCrearProducto(-1);
  };
  const handleAgregarProductos = (nuevosProductos: DetalleOrdenCompra[]) => {
    setDetalles((prev) => [...prev, ...nuevosProductos]);
  };
  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Error al cargar productos: {error.message}</p>
        </div>
      </div>
    );
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
      {showConfirmacionEliminar && (
        <Confirmacion
          isOpen={showConfirmacionEliminar}
          titulo="Eliminar Producto"
          mensaje={`¿Estás seguro de que deseas eliminar a este producto?`}
          onClose={() => setShowConfirmacionEliminar(false)}
          onConfirm={handleConfirmacionEliminar}
        />
      )}
      {showConfirmacionCrearProducto && (
        <Confirmacion
          isOpen={showConfirmacionCrearProducto}
          titulo="Crear Producto"
          mensaje={`¿Estás seguro de que deseas crear el producto ${detalles[indexCrearProducto]?.nombre}?`}
          onClose={() => setShowConfirmacionCrearProducto(false)}
          onConfirm={handleConfirmacionCrearProducto}
        />
      )}
      {mostrarAgregarProducto && (
        <AgregarProductoOC
          isOpen={mostrarAgregarProducto}
          onClose={() => setMostrarAgregarProducto(false)}
          onAgregar={handleAgregarProductos}
        />
      )}
      {/* Contenedor principal */}
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
            id="ordenCompra" //este campo es para registrar el id de la orden de compra y mostrarlo como sugerencia
            className="w-full p-4 border border-gray-300 rounded-md"
            placeholder="Ingrese el número de la orden de compra a buscar"
            onChange={(e) => setOrdenCompra(e.target.value)}
          />

          <button
            type="submit"
            className="bg-gray-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-gray-500 transition duration-300 w-full sm:w-auto whitespace-nowrap"
            onClick={handleBuscarOrdenCompra}
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
                    Trazabilidad
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
                      {detalle.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.nombre}
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
                    {/* Validación si el producto debe tener trazabilidad */}
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {detalle.producto?.trazabilidad ? (
                        <button className="bg-blue-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-blue-500 transition duration-300 w-full whitespace-nowrap">
                          Registrar
                        </button>
                      ) : (
                        <span className="text-sm"></span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <div className="flex flex-row gap-2 justify-center">
                        {/* Validación si el productos existe en la db */}
                        {detalle.producto == null ? (
                          <button
                            className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-blue-400 hover:bg-blue-500 "
                            onClick={() => {
                              setShowConfirmacionCrearProducto(true);
                              setIndexCrearProducto(index);
                            }}
                          >
                            Producto no existe
                          </button>
                        ) : (
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
                        )}
                        <button
                          className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-red-400 hover:bg-red-500 "
                          onClick={() => {
                            setShowConfirmacionEliminar(true);
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
            {/* Botón para agregar nuevo producto a la lista */}
            <div className="flex justify-end">
              <button
                className="bg-gray-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-gray-500 transition duration-300 w-full sm:w-auto whitespace-nowrap mt-4"
                onClick={() => setMostrarAgregarProducto(true)}
              >
                Agregar Producto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdenCompraPage;
