"use client";
import React, { useState, useEffect, useRef } from "react";

interface PalletFilterProps {
  palletGroups: number[];
  selectedPallet: number | null;
  onPalletChange: (pallet: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const PalletFilter: React.FC<PalletFilterProps> = ({
  palletGroups,
  selectedPallet,
  onPalletChange,
  disabled = false,
  placeholder = "Todos los pallets",
}) => {
  const [isOpen, setIsOpen] = useState(false);
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

  const handlePalletSelect = (pallet: number | null) => {
    onPalletChange(pallet);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (selectedPallet === null) {
      return placeholder;
    } else {
      return `Pallet ${selectedPallet}`;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Botón principal del dropdown */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full flex items-center justify-between py-3 px-3 border rounded-md text-left ${
          disabled
            ? "bg-gray-100 cursor-not-allowed text-gray-400"
            : "bg-white hover:bg-gray-50 border-gray-300"
        }`}
      >
        <span className="block truncate">{getDisplayText()}</span>
        <div className="flex items-center gap-2">
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Opción "Todos los pallets" */}
          <button
            onClick={() => handlePalletSelect(null)}
            className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
              selectedPallet === null ? "bg-orange-50 text-orange-600" : ""
            }`}
          >
            <span className="text-sm text-gray-900">Todos los pallets</span>
          </button>

          {/* Lista de pallets */}
          <div className="max-h-48 overflow-y-auto">
            {palletGroups.length > 0 ? (
              palletGroups.map((pallet) => (
                <button
                  key={pallet}
                  onClick={() => handlePalletSelect(pallet)}
                  className={`w-full text-left p-3 hover:bg-gray-50 transition-colors ${
                    selectedPallet === pallet
                      ? "bg-orange-50 text-orange-600"
                      : ""
                  }`}
                >
                  <span className="text-sm text-gray-900">Pallet {pallet}</span>
                </button>
              ))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                No hay pallets disponibles
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PalletFilter;
