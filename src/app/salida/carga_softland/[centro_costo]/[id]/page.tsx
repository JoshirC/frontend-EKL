"use client";

import React, { use, useMemo, useState } from "react";
import { useQuery } from "@apollo/client";
import { GET_ORDEN_ACOPIO } from "@/graphql/query";
import Alert from "@/components/Alert";
import ListaVacia from "@/components/listaVacia";

type Producto = {
  codigo: string;
  nombre_producto: string;
  unidad_medida: string;
  familia: string;
  cantidad: number;
};

type Pallet = {
  id: number;
  numero_pallet: number;
};

type Envio = {
  id: number;
  cantidad_enviada: number;
  codigo_producto_enviado: string;
  pallet: Pallet;
};

type DetalleOrdenAcopio = {
  id: number;
  codigo_producto: string;
  cantidad: number;
  enviado: boolean;
  producto: Producto;
  envios: Envio[];
};

type OrdenAcopio = {
  id: number;
  centroCosto: string;
  fecha: string;
  estado: string;
  detalles: DetalleOrdenAcopio[];
  pallets: Pallet[];
};

interface PageProps {
  params: Promise<{ id: string }>;
}

type EnvioConProducto = Envio & {
  producto: Producto;
  detalle: DetalleOrdenAcopio;
};
type FormErrors = {
  codigoBodega?: string;
  concepto?: string;
  descripcion?: string;
  codigoCentroCosto?: string;
};

const CargaGuiaSalidaPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const id_orden_acopio = parseFloat(id);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const [palletsSeleccionados, setPalletsSeleccionados] = useState<number[]>(
    []
  );
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState<FormErrors>({
    codigoBodega: "",
    concepto: "",
    descripcion: "",
    codigoCentroCosto: "",
  });
  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.codigoBodega || formData.codigoBodega.trim() === "") {
      errors.codigoBodega = "El código de bodega es requerido.";
    }
    if (!formData.concepto || formData.concepto.trim() === "") {
      errors.concepto = "El concepto es requerido.";
    }
    if (
      !formData.codigoCentroCosto ||
      formData.codigoCentroCosto.trim() === ""
    ) {
      errors.codigoCentroCosto = "El código del centro de costo es requerido.";
    }
    setErrors(errors);
    setIsFormValid(Object.keys(errors).length === 0);
  };
  const { loading, error, data } = useQuery(GET_ORDEN_ACOPIO, {
    variables: { id: id_orden_acopio },
  });

  // Procesar datos para obtener lista de todos los envíos
  const todosLosEnvios = useMemo((): EnvioConProducto[] => {
    if (!data?.ordenAcopio) return [];

    const orden: OrdenAcopio = data.ordenAcopio;
    const envios: EnvioConProducto[] = [];

    // Recorrer todos los detalles y sus envíos
    orden.detalles.forEach((detalle) => {
      detalle.envios.forEach((envio) => {
        if (envio.pallet) {
          envios.push({
            ...envio,
            producto: detalle.producto,
            detalle: detalle,
          });
        }
      });
    });

    // Ordenar por número de pallet y luego por nombre de producto
    return envios.sort((a, b) => {
      const palletCompare = a.pallet.numero_pallet - b.pallet.numero_pallet;
      if (palletCompare !== 0) return palletCompare;
      return a.producto.nombre_producto.localeCompare(
        b.producto.nombre_producto
      );
    });
  }, [data]);

  // Obtener lista única de pallets para el filtro
  const palletsDisponibles = useMemo(() => {
    const pallets = todosLosEnvios.map((envio) => envio.pallet.numero_pallet);
    return [...new Set(pallets)].sort((a, b) => a - b);
  }, [todosLosEnvios]);

  // Filtrar envíos por pallets seleccionados
  const enviosFiltrados = useMemo(() => {
    let enviosFiltrados = todosLosEnvios;

    // Filtrar por pallets seleccionados
    if (palletsSeleccionados.length > 0) {
      enviosFiltrados = enviosFiltrados.filter((envio) =>
        palletsSeleccionados.includes(envio.pallet.numero_pallet)
      );
    }

    return enviosFiltrados;
  }, [todosLosEnvios, palletsSeleccionados]);

  // Función para manejar la selección/deselección de pallets
  const togglePallet = (numeroPallet: number) => {
    setPalletsSeleccionados((prev) => {
      if (prev.includes(numeroPallet)) {
        // Si ya está seleccionado, lo removemos
        return prev.filter((p) => p !== numeroPallet);
      } else {
        // Si no está seleccionado, lo agregamos
        return [...prev, numeroPallet];
      }
    });
  };

  // Función para seleccionar todos los pallets
  const seleccionarTodos = () => {
    setPalletsSeleccionados([]);
  };

  // Función para verificar si un pallet está seleccionado
  const isPalletSeleccionado = (numeroPallet: number) => {
    return palletsSeleccionados.includes(numeroPallet);
  };
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

  if (loading) {
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando orden de acopio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10">
        <Alert
          type="error"
          message={`Error al cargar la orden: ${error.message}`}
          onClose={() => {}}
        />
      </div>
    );
  }

  const orden: OrdenAcopio = data?.ordenAcopio;

  if (!orden) {
    return (
      <div className="p-10">
        <Alert
          type="error"
          message="No se encontró la orden de acopio"
          onClose={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10">
      {showAlert && (
        <Alert
          type={alertType}
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}

      <div className="bg-white p-4 sm:p-6 rounded shadow">
        {/* Header */}
        <div className="mb-6 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
            <div className="w-full">
              <h1 className="text-xl font-bold text-gray-800">
                Guía de Salida - Orden #{orden.id}
              </h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 w-full">
                <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm w-full">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">Centro de Costo</p>
                      <p className="font-semibold text-gray-800">
                        {data?.ordenAcopio.centroCosto ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm w-full">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">Fecha Despacho</p>
                      <p className="font-semibold text-gray-800">
                        {data?.ordenAcopio.fechaDespacho ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-100 border-l-4 border-gray-500 p-4 rounded-lg shadow-sm w-full">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium">Cantidad de Pallets</p>
                      <p className="font-semibold text-gray-800">
                        {orden.pallets ? orden.pallets.length : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Cabecera Guía de Salida */}
          <div className="mt-4 w-full">
            <h2 className="font-semibold text-gray-800">
              Formulario Guía de Salida
            </h2>
            {/* Formulario de la Guia de Salida */}
            <form onSubmit={handleSubmit}>
              <div className="mt-3">
                {/* Primera fila de campos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label
                      htmlFor="codigoBodega"
                      className="block text-sm font-medium text-gray-700 mb-3"
                    >
                      Código Bodega *
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
                      value={formData.codigoBodega}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="concepto"
                      className="block text-sm font-medium text-gray-700 mb-3"
                    >
                      Concepto de Salida *
                    </label>
                    <input
                      id="concepto"
                      name="concepto"
                      type="text"
                      className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.concepto ? "border-red-500" : "border-gray-300"
                      }`}
                      onChange={handleChange}
                      value={formData.concepto}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="codigoCentroCosto"
                      className="block text-sm font-medium text-gray-700 mb-3"
                    >
                      Código Centro Costo *
                    </label>
                    <input
                      id="codigoCentroCosto"
                      name="codigoCentroCosto"
                      type="text"
                      className={`p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.codigoCentroCosto
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      onChange={handleChange}
                      value={formData.codigoCentroCosto}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="codigoCentroCosto"
                      className="block text-sm font-medium text-gray-700 mb-3"
                    >
                      Descripción
                    </label>
                    <input
                      id="descripcion"
                      name="descripcion"
                      type="string"
                      className="p-3 w-full border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500  border-gray-300"
                      onChange={handleChange}
                      value={formData.descripcion || ""}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Selector de Pallets */}
          <div className="mt-4 w-full">
            <h2 className="font-semibold text-gray-800 mb-3">
              Pallets Disponibles
            </h2>
            <div className="flex flex-wrap gap-2 w-full">
              {/* Botón para mostrar todos */}
              <button
                onClick={seleccionarTodos}
                className={`px-4 py-2 rounded font-semibold transition-all duration-200 ${
                  palletsSeleccionados.length === 0
                    ? "bg-orange-400 text-white shadow-md"
                    : "bg-gray-300 text-gray-500 hover:bg-orange-400 hover:text-white"
                }`}
                style={{ minWidth: 120 }}
              >
                Todos los Pallets
              </button>

              {/* Botones de pallets */}
              {palletsDisponibles.map((numeroPallet) => (
                <button
                  key={numeroPallet}
                  onClick={() => togglePallet(numeroPallet)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isPalletSeleccionado(numeroPallet)
                      ? "bg-orange-400 text-white shadow-md"
                      : "bg-gray-300 text-gray-500 hover:bg-orange-400 hover:text-white"
                  }`}
                  style={{ minWidth: 80 }}
                >
                  {numeroPallet}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* Tabla de productos */}
        <div className="mt-4">
          <h2 className="font-semibold text-gray-800 mb-4">
            Listado de Productos
          </h2>
        </div>
        {enviosFiltrados.length === 0 ? (
          <ListaVacia mensaje="No se encontraron envíos para esta orden" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-center border-collapse border border-gray-200 mt-2 min-w-[600px]">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Familia
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Código Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Producto
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Unidad
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Cantidad Enviada
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                    Pallet Asignado
                  </th>
                </tr>
              </thead>
              <tbody>
                {enviosFiltrados.map((envio) => (
                  <tr key={envio.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {envio.producto.familia}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {envio.codigo_producto_enviado}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {envio.producto.nombre_producto}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {envio.producto.unidad_medida}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {envio.cantidad_enviada}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2 text-sm sm:text-base">
                      {envio.pallet.numero_pallet}
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

export default CargaGuiaSalidaPage;
