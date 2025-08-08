"use client";
import React, { useState, useEffect, useRef } from "react";

interface FamilyFilterProps {
  familyGroups: string[];
  selectedFamilies: string[];
  onFamilyChange: (families: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  // Props para el buscador
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  searchPlaceholder?: string;
  showSearch?: boolean;
}

const FamilyFilter: React.FC<FamilyFilterProps> = ({
  familyGroups,
  selectedFamilies,
  onFamilyChange,
  disabled = false,
  placeholder = "Seleccionar familias...",
  // Props del buscador
  searchTerm = "",
  onSearchChange,
  searchPlaceholder = "Buscar por código o descripción...",
  showSearch = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [familySearchTerm, setFamilySearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown cuando se hace click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar familias según búsqueda
  const filteredFamilies = familyGroups.filter((family) =>
    family.toLowerCase().includes(familySearchTerm.toLowerCase())
  );

  const handleFamilyToggle = (family: string) => {
    const isSelected = selectedFamilies.includes(family);
    if (isSelected) {
      onFamilyChange(selectedFamilies.filter((f) => f !== family));
    } else {
      onFamilyChange([...selectedFamilies, family]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFamilies.length === familyGroups.length) {
      onFamilyChange([]);
    } else {
      onFamilyChange([...familyGroups]);
    }
  };

  const handleClearAll = () => {
    onFamilyChange([]);
  };

  const getDisplayText = () => {
    if (selectedFamilies.length === 0) {
      return placeholder;
    } else if (selectedFamilies.length === 1) {
      return selectedFamilies[0];
    } else if (selectedFamilies.length === familyGroups.length) {
      return "Todas las familias";
    } else {
      return "Familias seleccionadas";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      {/* Buscador principal */}
      {showSearch && onSearchChange && (
        <div className="flex-1 relative">
          {/* Icono de búsqueda */}
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            className={`w-full p-3 pl-10 pr-10 border rounded-md ${
              disabled
                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                : "bg-white hover:bg-gray-50 border-gray-300"
            }`}
          />

          {/* Botón para limpiar búsqueda */}
          {searchTerm && !disabled && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400 hover:text-red-500 transition-colors"
              type="button"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Filtro de familias */}
      <div className="relative w-full sm:w-80" ref={dropdownRef}>
        {/* Botón principal del dropdown */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full flex items-center justify-between py-2 px-3 border rounded-md text-left ${
            disabled
              ? "bg-gray-100 cursor-not-allowed text-gray-400"
              : "bg-white hover:bg-gray-50 border-gray-300"
          }`}
        >
          <span className="block truncate">{getDisplayText()}</span>
          <div className="flex items-center gap-2">
            {selectedFamilies.length >= 0 && (
              <span className="text-white font-semibold bg-orange-400 rounded-lg px-4 py-2 text-xs">
                {selectedFamilies.length}
              </span>
            )}
            <svg
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
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
          </div>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
            {/* Acciones rápidas */}
            <div className="p-2 border-b border-gray-200 flex gap-2">
              <button
                onClick={handleSelectAll}
                className="flex-1 px-3 py-2 font-semibold bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors"
              >
                {selectedFamilies.length === familyGroups.length
                  ? "Deseleccionar Todo"
                  : "Seleccionar Todo"}
              </button>
            </div>

            {/* Lista de familias */}
            <div className="max-h-48 overflow-y-auto">
              {filteredFamilies.length > 0 ? (
                filteredFamilies.map((family) => (
                  <label
                    key={family}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFamilies.includes(family)}
                      onChange={() => handleFamilyToggle(family)}
                      className="mr-3 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900 flex-1">
                      {family}
                    </span>
                  </label>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 text-center">
                  No se encontraron familias
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyFilter;
