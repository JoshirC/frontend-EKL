"use client";
import React, { useState, useEffect } from "react";
import { GET_ORDEN_COMPRA } from "@/graphql/query";
import {
  CREATE_PRODUCTO_SOFTLAND,
  CREATE_GUIA_ENTRADA_WITH_DETAILS,
  CORREO_CAMBIOS_EN_ORDEN_COMPRA,
} from "@/graphql/mutations";
import { useLazyQuery, useMutation } from "@apollo/client";
import Alert from "@/components/Alert";
import Confirmacion from "@/components/confirmacion";
import AgregarProductoOC from "@/components/entrada_productos/agregarProductoOC";
import DropdownTrazabilidad from "@/components/entrada_productos/dropdownTrazabilidad";
import { formatDateToDDMMYYYY } from "@/utils/dataUtils";

// 1. Estado para almacenar la trazabilidad de productos
type TrazabilidadProducto = {
  codigoProducto: string;
  datos: {
    numero_lote: string;
    cantidad_producto: number;
    fecha_elaboracion: string;
    fecha_vencimiento: string;
    temperatura: string;
    observaciones: string;
    codigo_producto: string;
    rut_usuario: string;
  };
};

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
type OrdenCompra = {
  productos: DetalleOrdenCompra[];
  ultimo_num_inter: number;
};
type FormErrors = {
  codigoBodega?: string;
  numeroFolio?: string;
  codigoProveedor?: string;
  codigoCentroCosto?: string;
  numeroFactura?: string;
  fechaFactura?: string;
  producto?: string;
};
// 1. Agrega el tipo para el historial de cambios
type HistorialProducto = {
  codigo_producto: string;
  nombre: string;
  estado: "agregado" | "eliminado" | "editado";
  cantidad_solicitada: number;
  cantidad_ingresada: number;
};

const OrdenCompraPage: React.FC = () => {
  // Estado para almacenar el número de orden de compra
  const [ordenCompra, setOrdenCompra] = useState<string>("");
  // Estado para almacenar los detalles de la orden de compra
  const [detalles, setDetalles] = useState<DetalleOrdenCompra[]>([]);
  const [detallesOriginales, setDetallesOriginales] = useState<
    DetalleOrdenCompra[]
  >([]);
  const [botonCargar, setBotonCaragar] = useState(false);
  // Estado para el historial de cambios de productos
  const [historialCambiosProductos, setHistorialCambiosProductos] = useState<
    HistorialProducto[]
  >([]);
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
  const [botonBuscar, setBotonBuscar] = useState(false);
  // Estado para la fecha de hoy
  const today = new Date();
  const [fetchOrdenCompra, { data, loading, error, refetch }] =
    useLazyQuery(GET_ORDEN_COMPRA);
  //Estado para abrir dropdown de trazabilidad
  const [showDropdownTrazabilidad, setShowDropdownTrazabilidad] =
    useState(false);
  const [idTrazabilidad, setIdTrazabilidad] = useState<number | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [formData, setFormData] = useState({
    codigoBodega: "",
    numeroFolio: 0,
    codigoProveedor: "",
    observacion: "",
    numeroFactura: 0,
    fechaFactura: "",
  });
  const [trazabilidadProductos, setTrazabilidadProductos] = useState<
    TrazabilidadProducto[]
  >([]);
  const [correoCambios] = useMutation(CORREO_CAMBIOS_EN_ORDEN_COMPRA, {
    onCompleted: (data) => {
      if (data.notificarCambiosEnOrden) {
        setHistorialCambiosProductos([]);
      } else {
        console.error(
          "Error al enviar el correo de cambios en la orden de compra."
        );
      }
    },
    onError: (error) => {
      console.error(
        `Error al enviar el correo de cambios en la orden de compra: ${error.message}`
      );
    },
  });
  const [createGuiaEntrada] = useMutation(CREATE_GUIA_ENTRADA_WITH_DETAILS, {
    onCompleted: (data) => {
      if (data.createGuiaEntradaWithDetails) {
        setAlertType("exitoso");
        setAlertMessage("Guía de entrada creada exitosamente.");
        setShowAlert(true);
        handleEnviarCorreoCambios();
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setAlertType("error");
        setAlertMessage("Error al crear la guía de entrada.");
        setShowAlert(true);
        setBotonCaragar(false);
      }
    },
    onError: (error) => {
      setAlertType("error");
      setAlertMessage(`Error: ${error.message}`);
      setShowAlert(true);
    },
  });
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
            const nuevosDetalles = result.data.ordenCompra.productos;
            setDetalles(nuevosDetalles);
            setDetallesOriginales(nuevosDetalles); // actualiza también los originales
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
      if (!data?.ordenCompra) {
        setAlertType("error");
        setAlertMessage("No se encontró la orden de compra.");
        setShowAlert(true);
        setDetalles([]);
        setDetallesOriginales([]);
      } else {
        setDetallesOriginales(data.ordenCompra.productos);
        setDetalles(data.ordenCompra.productos);
        setFormData((prev) => ({
          ...prev,
          numeroFolio: data.ordenCompra.ultimo_num_inter,
        }));
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
    // Clona el array y el objeto a editar
    const nuevaLista: DetalleOrdenCompra[] = [...detalles];
    const detalleEditado = { ...nuevaLista[index] };

    // Edita el campo
    detalleEditado[campo] = valor as never;

    // Recalcula el total
    detalleEditado.valor_total =
      detalleEditado.cantidad * detalleEditado.precio_unitario;

    // Actualiza el array de detalles
    nuevaLista[index] = detalleEditado;
    setDetalles(nuevaLista);

    // 🔁 Actualizar cantidad en trazabilidad si existe
    const existeTrazabilidad = trazabilidadProductos.find(
      (t) => t.codigoProducto === detalleEditado.codigo
    );
    if (existeTrazabilidad && campo === "cantidad") {
      setTrazabilidadProductos((prev) =>
        prev.map((t) =>
          t.codigoProducto === detalleEditado.codigo
            ? {
                ...t,
                datos: {
                  ...t.datos,
                  cantidad_producto: valor,
                },
              }
            : t
        )
      );
    }

    // Actualizar historial de cambios
    const detalleOriginal = detallesOriginales.find(
      (d) => d.codigo === detalleEditado.codigo
    );

    setHistorialCambiosProductos((prev) => {
      const filtrado = prev.filter(
        (item) =>
          !(
            item.codigo_producto === detalleEditado.codigo &&
            item.estado === "editado"
          )
      );

      return [
        ...filtrado,
        {
          codigo_producto: detalleEditado.codigo,
          nombre: detalleEditado.nombre,
          estado: "editado" as const,
          cantidad_solicitada: detalleOriginal?.cantidad || 0,
          cantidad_ingresada: detalleEditado.cantidad,
        },
      ];
    });
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
  const handleCrearGuiaEntrada = async () => {
    if (detalles.length === 0) {
      setAlertType("advertencia");
      setAlertMessage("No hay productos para crear la guía de entrada.");
      setShowAlert(true);
      return;
    }
    const fecha_generacion = `${today.getDate().toString().padStart(2, "0")}/${(
      today.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
    const dataTrazabilidad = trazabilidadProductos.map((t) => ({
      numero_lote: t.datos.numero_lote,
      cantidad_producto: t.datos.cantidad_producto,
      fecha_elaboracion: t.datos.fecha_elaboracion,
      fecha_vencimiento: t.datos.fecha_vencimiento,
      temperatura: t.datos.temperatura,
      observaciones: t.datos.observaciones,
      fecha_registro: fecha_generacion,
      codigo_proveedor: formData.codigoProveedor,
      numero_factura: formData.numeroFactura,
      codigo_producto: t.codigoProducto,
      rut_usuario: t.datos.rut_usuario,
    }));
    const detallesGuiaEntrada = detalles.map((detalle) => ({
      codigo_producto: detalle.codigo,
      cantidad_ingresada: detalle.cantidad,
      precio_unitario: detalle.precio_unitario,
    }));

    const guiaEntradaData = {
      numero_orden_compra: parseInt(ordenCompra, 10),
      fecha_generacion,
      guiaEntradaDetalle: detallesGuiaEntrada,
      codigo_bodega: formData.codigoBodega,
      numero_folio: formData.numeroFolio,
      codigo_proveedor: formData.codigoProveedor,
      observacion: formData.observacion || "",
      numero_factura: formData.numeroFactura,
      fecha_factura: formData.fechaFactura,
      trazabilidad: dataTrazabilidad,
    };
    console.log("Datos de la guía de entrada:", guiaEntradaData);
    createGuiaEntrada({
      variables: { createGuiaEntradaInput: guiaEntradaData },
    });
  };

  useEffect(() => {
    validateForm();
  }, [formData, detalles, trazabilidadProductos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("numero") ||
        name.includes("Folio") ||
        name.includes("Factura")
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fechaFactura: formatDateToDDMMYYYY(value),
    }));
  };
  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.codigoBodega || formData.codigoBodega === "")
      newErrors.codigoBodega = "Código de bodega es requerido";
    if (formData.numeroFolio <= 0)
      newErrors.numeroFolio = "Número de folio debe ser mayor a 0";
    if (formData.codigoProveedor === "" || !formData.codigoProveedor)
      newErrors.codigoProveedor = "Proveedor es requerido";
    if (formData.numeroFactura <= 0)
      newErrors.numeroFactura = "Número de factura debe ser mayor a 0";
    if (formData.fechaFactura === "" || !formData.fechaFactura)
      newErrors.fechaFactura = "Fecha de factura es requerida";

    // Validación adicional: todos los productos deben existir
    const hayProductoNull = Array.isArray(detalles)
      ? detalles.some((detalle) => detalle.producto === null)
      : false;
    if (hayProductoNull) {
      newErrors.producto = "Todos los productos deben existir en la DB";
    }

    // Validación de trazabilidad
    const productosConTrazabilidad = Array.isArray(detalles)
      ? detalles.filter((detalle) => detalle.producto?.trazabilidad)
      : [];
    const codigosTrazabilidad = trazabilidadProductos.map(
      (t) => t.codigoProducto
    );
    const faltanTrazabilidad = productosConTrazabilidad.some(
      (detalle) => !codigosTrazabilidad.includes(detalle.codigo)
    );
    if (faltanTrazabilidad) {
      newErrors.producto =
        (newErrors.producto ? newErrors.producto + " y " : "") +
        "Todos los productos con trazabilidad deben tener datos registrados";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();
    if (!isFormValid) {
      setAlertType("error");
      setAlertMessage("Por favor, complete todos los campos requeridos.");
      setShowAlert(true);
      return;
    }
  };
  const handleTrazabilidadGuardada = (codigoProducto: string, datos: any) => {
    setTrazabilidadProductos((prev) => {
      const existe = prev.find((t) => t.codigoProducto === codigoProducto);
      if (existe) {
        return prev.map((t) =>
          t.codigoProducto === codigoProducto ? { codigoProducto, datos } : t
        );
      }
      return [...prev, { codigoProducto, datos }];
    });
    setShowDropdownTrazabilidad(false);
    setIdTrazabilidad(null);
  };
  const handleEnviarCorreoCambios = async () => {
    if (historialCambiosProductos.length === 0) {
      return;
    }

    try {
      await correoCambios({
        variables: {
          input: {
            ordenCompra: ordenCompra,
            productos: historialCambiosProductos.map((prod) => ({
              codigo_producto: prod.codigo_producto,
              nombre: prod.nombre,
              estado: prod.estado,
              cantidad_solicitada: prod.cantidad_solicitada,
              cantidad_ingresada: prod.cantidad_ingresada,
            })),
          },
        },
      });
      console.log("Correo enviado exitosamente.");
      setHistorialCambiosProductos([]);
    } catch (error: any) {
      console.error("Error al enviar el correo:", error.message);
    }
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
        <div className="bg-white p-6 rounded shadow flex justify-between items-center">
          <p>{error.message}</p>
          <button
            className="bg-gray-400 text-white font-semibold p-3 rounded hover:bg-gray-500 transition duration-300"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
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
        <h1 className="text-2xl font-semibold">Orden de Compra</h1>
        {/* Buscador y Botón */}
        <div className=" flex flex-col sm:flex-row gap-4 mt-4">
          <input
            id="ordenCompra"
            className="w-full p-4 border border-gray-300 rounded-md"
            placeholder="Ingrese el número de la orden de compra a buscar"
            onChange={(e) => setOrdenCompra(e.target.value)}
          />

          <button
            type="submit"
            className="bg-gray-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-gray-500 transition duration-300 w-full sm:w-auto whitespace-nowrap"
            onClick={() => {
              handleBuscarOrdenCompra();
              setBotonBuscar(true);
            }}
          >
            Buscar
          </button>
        </div>
        {/* Tabla de Contenidos */}
        {detalles.length > 0 && ordenCompra != "" ? (
          <div>
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">
                    Información de la Guía
                  </h2>
                  <button
                    className={`w-full sm:w-auto font-semibold p-3 rounded transition-colors duration-200 shadow-sm ${
                      isFormValid
                        ? "bg-orange-400 hover:bg-orange-500 text-white cursor-pointer"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={!isFormValid || botonCargar}
                    type="submit"
                    onClick={() => {
                      handleCrearGuiaEntrada();
                      setBotonCaragar(true);
                    }}
                  >
                    {botonCargar ? "Ingresando" : "Generar Guía de Entrada"}
                  </button>
                </div>
                {/* Primera fila de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="numeroFolio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Número de Folio
                    </label>
                    <div className="p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300">
                      {formData.numeroFolio}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="codigoProveedor"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Código Proveedor *
                    </label>
                    <input
                      id="codigoProveedor"
                      name="codigoProveedor"
                      type="text"
                      className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.codigoProveedor
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="codigoBodega"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Código de Bodega *
                    </label>
                    <input
                      id="codigoBodega"
                      name="codigoBodega"
                      type="text"
                      className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.codigoBodega
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Segunda fila de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label
                      htmlFor="numeroFactura"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Número de Factura *
                    </label>
                    <input
                      id="numeroFactura"
                      name="numeroFactura"
                      type="number"
                      min="1"
                      className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.numeroFactura
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="fechaFactura"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Fecha de Factura *
                    </label>
                    <input
                      id="fechaFactura"
                      name="fechaFactura"
                      type="date"
                      className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.fechaFactura
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={handleDateChange}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="observacion"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Observación
                    </label>
                    <input
                      id="observacion"
                      name="observacion"
                      type="text"
                      className="p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-gray-300"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </form>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">
              Productos para la Guia de Entrada
            </h2>
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
                      Cantidad Unitaria
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
                    <React.Fragment key={index}>
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
                                name="cantidad"
                                id="cantidad"
                                min="1"
                                step="any"
                                placeholder={detalle.cantidad.toString()}
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-md"
                                onChange={(e) =>
                                  handleEditarDetalles(
                                    index,
                                    "cantidad",
                                    parseFloat(e.target.value)
                                  )
                                }
                              />
                            </td>
                            <td className="border border-gray-300 px-2 sm:px-4 py-2">
                              <input
                                name="precio_unitario"
                                id="precio_unitario"
                                type="number"
                                min="1"
                                step="any"
                                placeholder={detalle.precio_unitario.toString()}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                onChange={(e) =>
                                  handleEditarDetalles(
                                    index,
                                    "precio_unitario",
                                    parseFloat(e.target.value)
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
                          $ {detalle.valor_total.toFixed(2)}
                        </td>
                        {/* Validación si el producto debe tener trazabilidad */}
                        <td className="border border-gray-300 px-2 sm:px-4 py-2">
                          {detalle.producto?.trazabilidad ? (
                            <button
                              className={`bg-blue-400 text-white font-semibold p-3 sm:p-4 rounded hover:bg-blue-500 transition duration-300 w-full whitespace-nowrap ${
                                trazabilidadProductos.some(
                                  (t) => t.codigoProducto === detalle.codigo
                                )
                                  ? "opacity-60 cursor-not-allowed"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                setShowDropdownTrazabilidad(true);
                                setIdTrazabilidad(index);
                              }}
                              disabled={trazabilidadProductos.some(
                                (t) => t.codigoProducto === detalle.codigo
                              )}
                            >
                              {trazabilidadProductos.some(
                                (t) => t.codigoProducto === detalle.codigo
                              )
                                ? "Trazabilidad registrada"
                                : "Registrar"}
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
                                Crear Producto
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
                            {indexEditar == index ? (
                              <button
                                className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-gray-400 hover:bg-gray-500"
                                onClick={() => setIndexEditar(-1)}
                              >
                                Cancelar
                              </button>
                            ) : (
                              <button
                                className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-red-400 hover:bg-red-500 "
                                onClick={() => {
                                  setShowConfirmacionEliminar(true);
                                  setIndexEliminar(index);
                                }}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Dropdown de trazabilidad */}
                      {idTrazabilidad === index && (
                        <tr>
                          <td
                            colSpan={7}
                            className="border-0 p-2 sm:p-4 bg-gray-100"
                          >
                            <DropdownTrazabilidad
                              codigoProducto={detalle.codigo}
                              cantidadProducto={detalle.cantidad}
                              isOpen={showDropdownTrazabilidad}
                              onClose={() => {
                                setShowDropdownTrazabilidad(false);
                                setIdTrazabilidad(null);
                              }}
                              onTrazabilidadCompletado={(datos) =>
                                handleTrazabilidadGuardada(
                                  detalle.codigo,
                                  datos
                                )
                              }
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
          </div>
        ) : botonBuscar && ordenCompra.length !== 0 ? (
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              No se encontraron productos para la orden de compra ingresada.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrdenCompraPage;
