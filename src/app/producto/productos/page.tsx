"use client";
import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_PRODUCTOS } from "@/graphql/query";
import {
  UPDATE_TRAZABILIDAD,
  ACTUALIZAR_STOCK_SOFTLAND,
  ACTUALIZAR_INFO_PRODUCTOS_SOFTLAND,
  AJUSTE_DE_INVENTARIO,
  CORREO_AJUSTE_DE_INVENTARIO,
  ACTUALIZAR_STOCK_PENDIENTE_OC,
  UPDATE_STOCK_EMERGENCIA,
} from "@/graphql/mutations";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
import Cargando from "@/components/cargando";
import FamilyPagination from "@/components/FamilyPagination";
import CrearProducto from "@/components/adquisiciones/crearProducto";
import { useJwtStore } from "@/store/jwtStore";
import { Producto } from "@/types/graphql";

const ProductosPage: React.FC = () => {
  const { loading, error, data, refetch } = useQuery(GET_PRODUCTOS);
  const { nombreUsuario } = useJwtStore();
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState("");
  const [tituloConfirmacion, setTituloConfirmacion] = useState("");
  const [estadoConfirmacion, setEstadoConfirmacion] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Producto | null>(null);
  const [showCargando, setShowCargando] = useState(false);
  const [cargandoMensaje, setCargandoMensaje] = useState("");
  const [botonCargando, setBotonCargando] = useState(false);
  const [nuevaCantidad, setNuevaCantidad] = useState<number>(0.0);
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
    ACTUALIZAR_INFO_PRODUCTOS_SOFTLAND,
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
  const [actualizarStockPendienteOC] = useMutation(
    ACTUALIZAR_STOCK_PENDIENTE_OC,
    {
      onCompleted: () => {
        refetch();
        setShowCargando(false);
        setAlertType("exitoso");
        setAlertMessage("Stock pendiente (OC) actualizado correctamente");
        setShowAlert(true);
        setBotonCargando(false);
      },
      onError: (error) => {
        setBotonCargando(false);
        setShowCargando(false);
        setAlertType("error");
        setAlertMessage(
          `Error al actualizar stock pendiente (OC): ${error.message}`
        );
        setShowAlert(true);
      },
    }
  );
  const [updateStockEmergencia] = useMutation(UPDATE_STOCK_EMERGENCIA, {
    onCompleted: () => {
      setShowCargando(false);
      setBotonCargando(false);
      setAlertType("exitoso");
      setAlertMessage("Stock de emergencia actualizado correctamente");
      setShowAlert(true);
      refetch();
      setNuevaCantidad(0);
      setSelectedProduct(null);
    },
    onError: (error) => {
      setShowCargando(false);
      setBotonCargando(false);
      setAlertType("error");
      setAlertMessage(
        `Error al actualizar stock de emergencia: ${error.message}`
      );
      setShowAlert(true);
      setNuevaCantidad(0);
      setSelectedProduct(null);
    },
  });
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
            selectedFamilies.length === 0 ||
            selectedFamilies.includes(producto.familia);

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
  }, [data, searchTerm, selectedFamilies]);

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
  const handleActualizarStockPendienteOC = () => {
    setShowCargando(true);
    setBotonCargando(true);
    setCargandoMensaje("Actualizando stock pendiente (OC)");
    actualizarStockPendienteOC();
  };
  const handleActualizarStockEmergencia = (producto: Producto | null) => {
    if (producto) {
      setShowCargando(true);
      setBotonCargando(true);
      setCargandoMensaje("Actualizando stock de emergencia");
      updateStockEmergencia({
        variables: {
          codigo: producto.codigo,
          nuevaCantidad: nuevaCantidad,
        },
      });
    }
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
      {showCreateProduct && (
        <CrearProducto
          isOpen={showCreateProduct}
          onClose={() => setShowCreateProduct(false)}
          onProductCreated={() => refetch()}
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
                  : "bg-orange-400 text-white hover:bg-orange-500"
              }`}
              onClick={() => handleActualizarStockSoftland()}
              disabled={loading || botonCargando}
            >
              Actualizar Stock Softland
            </button>
            <button
              className={`font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap ${
                loading || botonCargando
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-orange-400 text-white hover:bg-orange-500"
              }`}
              onClick={() => handleActualizarStockPendienteOC()}
              disabled={loading || botonCargando}
            >
              Actualizar Stock Pendiente (OC)
            </button>
            <button
              className={`font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap ${
                loading || botonCargando
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-400 text-white hover:bg-blue-500"
              }`}
              onClick={() => setShowCreateProduct(true)}
            >
              Crear Producto
            </button>
            <button
              className={`font-semibold p-3 sm:p-4 rounded transition duration-300 w-full sm:w-auto whitespace-nowrap ${
                loading || botonCargando
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-400 text-white hover:bg-blue-500"
              }`}
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
        {/* Filtros */}
        <div className="mt-4 pb-4">
          <FamilyPagination
            familyGroups={familyGroups}
            selectedFamilies={selectedFamilies}
            onFamilyChange={setSelectedFamilies}
            disabled={botonCargando}
            placeholder="Filtrar por familias..."
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Buscar por código o descripción..."
            showSearch={true}
          />
        </div>
        {/* Tabla de Productos */}
        <div className="overflow-x-auto">
          <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
            <thead className="bg-gray-200">
              <tr>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Familia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Código
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Descripción
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                  Unidad
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Precio
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Stock Sistema
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Stock Softland
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Stock Emergencia
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Stock Pendiente
                </th>
                <th className="border border-gray-300 px-2 sm:px-4 py-2">
                  Stock a Enviar
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
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                      {producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                      {producto.codigo}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
                      {producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-left">
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
                      <div className="flex items-center justify-between space-x-2">
                        {selectedProduct?.codigo === producto.codigo &&
                        estadoConfirmacion === "stockEmergencia" ? (
                          <>
                            <input
                              type="number"
                              className="w-20 border p-3 rounded text-center"
                              value={nuevaCantidad}
                              onChange={(e) => {
                                const value = e.target.value;
                                setNuevaCantidad(
                                  value === "" ? 0 : parseFloat(value)
                                );
                              }}
                            />
                            <button
                              className="bg-blue-400 hover:bg-blue-500 text-white font-semibold p-3 rounded"
                              onClick={() => {
                                handleActualizarStockEmergencia(
                                  selectedProduct
                                );
                                setSelectedProduct(null);
                                setEstadoConfirmacion("");
                              }}
                            >
                              Guardar
                            </button>
                            <button
                              className="bg-red-400 hover:bg-red-500 text-white font-semibold p-3 rounded"
                              onClick={() => {
                                setSelectedProduct(null);
                                setEstadoConfirmacion("");
                              }}
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <span>{producto.cantidad_emergencia || 0}</span>
                            <button
                              className="bg-orange-400 hover:bg-orange-500 text-white font-semibold p-3 rounded"
                              onClick={() => {
                                setSelectedProduct(producto);
                                setEstadoConfirmacion("stockEmergencia");
                                setNuevaCantidad(
                                  producto.cantidad_emergencia || 0
                                );
                              }}
                            >
                              Editar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.cantidad_a_enviar || 0}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {producto.cantidad_oc || 0}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <button
                        className={`text-white font-semibold p-2 sm:p-3 rounded w-full whitespace-nowrap ${
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
                    colSpan={11}
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
