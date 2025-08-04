"use client";
import React, { useState, useEffect, useRef } from "react";
import { GET_GUIA_ENTRADA_BY_ESTADO } from "@/graphql/query";
import { useQuery } from "@apollo/client";
type GuiaEntrada = {
  id: number;
  numero_folio: number;
  numero_factura: number;
  fecha_factura: string;
  numero_orden_compra: number;
  fecha_generacion: string;
  observacion: string;
};

const GuiasEntradaPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("numero_folio");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { loading, error, data } = useQuery(GET_GUIA_ENTRADA_BY_ESTADO, {
    variables: { estado: "Cargada" },
  });

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  if (loading)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>Cargando guías...</p>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="p-10">
        <div className="bg-white p-6 rounded shadow">
          <p>{error.message}</p>
        </div>
      </div>
    );
  const guiasEntrada: GuiaEntrada[] = data?.guiaEntradaByEstado || [];

  // Función para filtrar las guías según el término de búsqueda
  const filteredGuias = guiasEntrada.filter((guia) => {
    if (!searchTerm) return true;

    const searchValue = searchTerm.toLowerCase();
    switch (searchType) {
      case "numero_folio":
        return guia.numero_folio.toString().includes(searchValue);
      case "numero_factura":
        return guia.numero_factura.toString().includes(searchValue);
      case "numero_orden_compra":
        return guia.numero_orden_compra.toString().includes(searchValue);
      default:
        return true;
    }
  });

  // Opciones del dropdown
  const searchOptions = [
    { value: "numero_folio", label: "N° Folio" },
    { value: "numero_factura", label: "N° Factura" },
    { value: "numero_orden_compra", label: "N° Orden de Compra" },
  ];

  const getSelectedLabel = () => {
    return (
      searchOptions.find((option) => option.value === searchType)?.label ||
      "N° Folio"
    );
  };

  const handleOptionSelect = (value: string) => {
    setSearchType(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="p-4 sm:p-10">
      <div className="bg-white p-4 sm:p-6 rounded-md shadow-md">
        {/* Encabezado de la página */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Guías de Entrada
          </h1>

          {/* Buscador */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {/* Dropdown personalizado */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="px-3 py-2 bg-orange-400 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-between min-w-[160px] font-medium"
              >
                <span>{getSelectedLabel()}</span>
                <svg
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  {/* Separador naranja */}
                  <div className="h-0.5 bg-orange-400"></div>
                  {searchOptions.map((option, index) => (
                    <button
                      key={option.value}
                      onClick={() => handleOptionSelect(option.value)}
                      className={`w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors duration-150 ${
                        index !== searchOptions.length - 1
                          ? "border-b border-gray-100"
                          : ""
                      } ${
                        searchType === option.value
                          ? "bg-orange-50 text-orange-700"
                          : ""
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Buscar por ${
                searchType === "numero_folio"
                  ? "N° Folio"
                  : searchType === "numero_factura"
                  ? "N° Factura"
                  : "N° Orden de Compra"
              }...`}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
        </div>
        {/* Tabla de Guías de Entrada */}
        <div className="overflow-x-auto">
          {filteredGuias.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                {searchTerm
                  ? `No se encontraron guías que coincidan con "${searchTerm}"`
                  : "No hay guías de entrada disponibles"}
              </p>
            </div>
          ) : (
            <table className="table-auto text-center w-full border-collapse border border-gray-200 mt-2 text-sm sm:text-base">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    N° Folio
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    N° Factura
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Fechar Factura
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    N° Orden de Compra
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Fecha Generación
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Observación
                  </th>
                  <th className="border border-gray-300 px-2 sm:px-4 py-2">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredGuias.map((guia) => (
                  <tr key={guia.id}>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_folio}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_factura}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.fecha_factura}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.numero_orden_compra}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.fecha_generacion}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      {guia.observacion}
                    </td>
                    <td className="border border-gray-300 px-2 sm:px-4 py-2">
                      <button
                        className="text-white font-semibold p-3 sm:p-4 rounded w-full whitespace-nowrap bg-orange-400 hover:bg-orange-500 transition duration-300"
                        onClick={() => {
                          window.location.href = `/adquisiciones/guias_entrada/${guia.id}`;
                        }}
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuiasEntradaPage;
