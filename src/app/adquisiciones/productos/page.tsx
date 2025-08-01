"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTOS } from "@/graphql/query";
import {
  UPDATE_TRAZABILIDAD,
  ACTUALIZAR_STOCK_SOFTLAND,
  ACTUALIZAR_PRODUCTOS_SOFTLAND,
  AJUSTE_DE_INVENTARIO,
  CORREO_AJUSTE_DE_INVENTARIO,
} from "@/graphql/mutations";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
import Cargando from "@/components/cargando";
import { useJwtStore } from "@/store/jwtStore";
type Producto = {
  id: number;
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  cantidad: number;
  cantidad_softland: number;
  precio_unitario: number;
  trazabilidad: boolean;
};

const ProductosPage: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTOS);
  const { nombreUsuario } = useJwtStore();
  const [currentFamily, setCurrentFamily] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [tituloConfirmacion, setTituloConfirmacion] = useState("");
  const [estadoConfirmacion, setEstadoConfirmacion] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [showCargando, setShowCargando] = useState(false);
  const [cargandoMensaje, setCargandoMensaje] = useState("");
  const [botonCargando, setBotonCargando] = useState(false);
  const [editTrazabilidad] = useMutation(UPDATE_TRAZABILIDAD, {
    onCompleted: () => {
      refetch();
      setAlertType("exitoso");
      setAlertMessage("Trazabilidad actualizada correctamente");
      setShowAlert(true);
      setBotonCargando(false);
    },
    onError: (error) => {
      setBotonCargando(false);
      setAlertType("error");
      setAlertMessage(`Error al actualizar trazabilidad: ${error.message}`);
      setShowAlert(true);
    },
  });
  const [ajusteDeInventarioSoftland] = useMutation(AJUSTE_DE_INVENTARIO, {
    onCompleted: () => {
      handleEnviarCorreoAjusteDeInventario();
      setBotonCargando(false);
    },
    onError: (error) => {
      setBotonCargando(false);
      setShowCargando(false);
      setAlertType("error");
      setAlertMessage(
        `Error al realizar ajuste de inventario: ${error.message}`
      );
      setShowAlert(true);
    },
  });
  const [correoAjusteDeInventario] = useMutation(CORREO_AJUSTE_DE_INVENTARIO, {
    onCompleted: () => {
      refetch();
      setBotonCargando(false);
      setShowCargando(false);
      setAlertType("exitoso");
      setAlertMessage("Ajuste de inventario realizado correctamente");
      setShowAlert(true);
    },
    onError: (error) => {
      setBotonCargando(false);
      setShowCargando(false);
      setAlertType("error");
      setAlertMessage(
        `Error al enviar correo de ajuste de inventario: ${error.message}`
      );
      setShowAlert(true);
    },
  });

  const [actualizarStockSoftland] = useMutation(ACTUALIZAR_STOCK_SOFTLAND, {
    onCompleted: () => {
      refetch();
      setShowCargando(false);
      setAlertType("exitoso");
      setAlertMessage("Stock de Softland actualizado correctamente");
      setShowAlert(true);
      setBotonCargando(false);
    },
    onError: (error) => {
      setBotonCargando(false);
      setShowCargando(false);
      setAlertType("error");
      setAlertMessage(
        `Error al actualizar stock de Softland: ${error.message}`
      );
      setShowAlert(true);
    },
  });
  const [actualizarProductosSoftland] = useMutation(
    ACTUALIZAR_PRODUCTOS_SOFTLAND,
    {
      onCompleted: () => {
        setShowCargando(false);
        setBotonCargando(false);
        refetch();
        setAlertType("exitoso");
        setAlertMessage("Productos de Softland actualizados correctamente");
        setShowAlert(true);
      },
      onError: (error) => {
        setBotonCargando(false);
        setShowCargando(false);
        setAlertType("error");
        setAlertMessage(
          `Error al actualizar productos de Softland: ${error.message}`
        );
        setShowAlert(true);
      },
    }
  );
  useEffect(() => {
    if (data?.productos) {
      const filtered = data.productos
        .filter((producto: Producto) => {
          const matchesSearch =
            producto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            producto.nombre_producto
              .toLowerCase()
              .includes(searchTerm.toLowerCase());

          const matchesFamily =
            !currentFamily || producto.familia === currentFamily;

          return matchesSearch && matchesFamily;
        })
        .sort((a: Producto, b: Producto) => {
          if (a.trazabilidad !== b.trazabilidad) {
            return a.trazabilidad ? -1 : 1;
          }
          return a.nombre_producto.localeCompare(b.nombre_producto);
        });

      setFilteredProducts(filtered);
    }
  }, [data, searchTerm, currentFamily]);

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

  const productos: Producto[] = data.productos;
  const familyGroups = Array.from(
    new Set(productos.map((p) => p.familia))
  ).sort();

  const handleConfirmacion = (confirmed: boolean) => {
    if (estadoConfirmacion === "trazabilidad") {
      if (confirmed && selectedProduct) {
        setBotonCargando(true);
        editTrazabilidad({
          variables: { codigo_producto: selectedProduct.codigo },
        });
      }
      setShowConfirmacion(false);
      setSelectedProduct(null);
    }
    if (estadoConfirmacion === "ajusteInventario") {
      if (confirmed) {
        setBotonCargando(true);
        setShowCargando(true);
        setCargandoMensaje("Realizando ajuste de inventario con Softland");
        ajusteDeInventarioSoftland();
      }
      setShowConfirmacion(false);
      setSelectedProduct(null);
    }
  };
  const handleActualizarStockSoftland = () => {
    setShowCargando(true);
    setBotonCargando(true);
    setCargandoMensaje("Actualizando stock de productos desde Softland");
    actualizarStockSoftland();
  };
  const handleActualizarProductosSoftland = () => {
    setShowCargando(true);
    setBotonCargando(true);
    setCargandoMensaje("Actualizando productos de Softland");
    actualizarProductosSoftland();
  };
  const handleEnviarCorreoAjusteDeInventario = () => {
    const fecha = new Date().toLocaleDateString();
    correoAjusteDeInventario({
      variables: {
        usuario: nombreUsuario,
        fecha: fecha,
      },
    });
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
          titulo={tituloConfirmacion}
          mensaje={mensajeConfirmacion}
          onClose={() => setShowConfirmacion(false)}
          onConfirm={handleConfirmacion}
        />
      )}
      {showCargando && (
        <Cargando
          isOpen={showCargando}
          mensaje={cargandoMensaje}
          onClose={() => setShowCargando(false)}
        />
      )}

      <div className="bg-white p-6 rounded shadow">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold">Listado de Productos</h1>
          <div className="flex items-center gap-2">
            <button
              className={`font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap ${
                loading || botonCargando
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-400 text-white hover:bg-orange-500"
              }`}
              onClick={() => handleActualizarProductosSoftland()}
              disabled={loading || botonCargando}
            >
              Actualizar Productos
            </button>
            <button
              className={`font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap ${
                loading || botonCargando
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-400 text-white hover:bg-blue-500"
              }`}
              onClick={() => handleActualizarStockSoftland()}
              disabled={loading || botonCargando}
            >
              Actualizar Stock Softland
            </button>
            <button
              className="bg-gray-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-gray-500 transition duration-300 w-full sm:w-auto whitespace-nowrap"
              onClick={() => {
                setTituloConfirmacion("Ajuste de Inventario");
                setMensajeConfirmacion(
                  "¿Estás seguro de que deseas realizar un ajuste de inventario?"
                );
                setEstadoConfirmacion("ajusteInventario");
                setShowConfirmacion(true);
              }}
            >
              Ajuste de Inventario
            </button>
          </div>
        </div>
        {/* Paginacion por familia */}
        <div className="flex flex-col sm:flex-row justify-start items-center mt-2 pb-4 gap-4">
          <div className="flex items-center gap-2 sm:w-auto w-full">
            <button
              onClick={() => {
                const currentIndex = familyGroups.indexOf(currentFamily || "");
                if (currentIndex > 0)
                  setCurrentFamily(familyGroups[currentIndex - 1]);
              }}
              disabled={
                !currentFamily ||
                familyGroups.indexOf(currentFamily) === 0 ||
                botonCargando
              }
              className={`p-3 rounded font-semibold text-sm sm:text-base ${
                !currentFamily || familyGroups.indexOf(currentFamily) === 0
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              Anterior
            </button>

            <div className="flex-1 overflow-x-hidden">
              <div className="flex space-x-2 justify-center">
                {familyGroups
                  .slice(
                    Math.max(
                      0,
                      Math.min(
                        familyGroups.indexOf(currentFamily || "") - 2,
                        familyGroups.length - 5
                      )
                    ),
                    Math.min(
                      familyGroups.indexOf(currentFamily || "") + 3,
                      familyGroups.length
                    )
                  )
                  .map((family) => (
                    <button
                      key={family}
                      onClick={() => setCurrentFamily(family)}
                      className={`p-3 rounded text-sm sm:text-base font-semibold min-w-max whitespace-nowrap ${
                        currentFamily === family
                          ? "bg-gray-400 text-white"
                          : "bg-gray-100 hover:bg-gray-300 text-gray-800"
                      }`}
                      disabled={botonCargando}
                    >
                      <span className="max-w-[100px] sm:max-w-[150px] truncate">
                        {family}
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            <button
              onClick={() => {
                const currentIndex = familyGroups.indexOf(currentFamily || "");
                if (currentIndex < familyGroups.length - 1)
                  setCurrentFamily(familyGroups[currentIndex + 1]);
              }}
              disabled={
                !currentFamily ||
                familyGroups.indexOf(currentFamily) ===
                  familyGroups.length - 1 ||
                botonCargando
              }
              className={`p-3 rounded font-semibold text-sm sm:text-base ${
                !currentFamily ||
                familyGroups.indexOf(currentFamily) === familyGroups.length - 1
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              Siguiente
            </button>
          </div>
          {/* Barra de Busqueda */}
          <input
            type="text"
            placeholder="Buscar por código, descripción..."
            className="w-full p-4 my-4 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {/* Tabla de Productos */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Código
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Unidad Medida
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio Unitario
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Cantidad Softland
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Trazabilidad
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.unidad_medida}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      $ {producto.precio_unitario}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.cantidad}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.cantidad_softland}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <button
                        className={`text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap ${
                          botonCargando
                            ? "bg-gray-400 cursor-not-allowed"
                            : producto.trazabilidad
                            ? "bg-blue-400 hover:bg-blue-500"
                            : "bg-red-400 hover:bg-red-500"
                        }`}
                        disabled={botonCargando}
                        onClick={() => {
                          setTituloConfirmacion("Trazabilidad");
                          setMensajeConfirmacion(
                            `¿Estás seguro de que deseas ${
                              producto.trazabilidad ? "desactivar" : "activar"
                            } la trazabilidad del producto: ${
                              producto.nombre_producto
                            }?`
                          );
                          setEstadoConfirmacion("trazabilidad");
                          setShowConfirmacion(true);
                          setSelectedProduct(producto);
                        }}
                      >
                        {producto.trazabilidad ? "SI" : "NO"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="border border-gray-300 px-4 py-6 text-center text-gray-500"
                  >
                    No se encontraron productos que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductosPage;
