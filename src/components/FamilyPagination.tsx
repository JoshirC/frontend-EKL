"use client";
import React, { useState, useEffect } from "react";

interface FamilyPaginationProps {
  familyGroups: string[];
  currentFamily: string | null;
  onFamilyChange: (family: string | null) => void;
  disabled?: boolean;
  showAllOption?: boolean;
  allOptionText?: string;
}

const FamilyPagination: React.FC<FamilyPaginationProps> = ({
  familyGroups,
  currentFamily,
  onFamilyChange,
  disabled = false,
  showAllOption = true,
  allOptionText = "Todas las familias",
}) => {
  const [screenSize, setScreenSize] = useState<"sm" | "md" | "lg">("lg");

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth < 640) {
        setScreenSize("sm");
      } else if (window.innerWidth < 1024) {
        setScreenSize("md");
      } else {
        setScreenSize("lg");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);
  const handlePrevious = () => {
    if (!currentFamily) {
      // Si no hay familia seleccionada y queremos ir hacia atrás, ir a la última
      onFamilyChange(familyGroups[familyGroups.length - 1]);
    } else {
      const currentIndex = familyGroups.indexOf(currentFamily);
      if (currentIndex > 0) {
        onFamilyChange(familyGroups[currentIndex - 1]);
      } else if (showAllOption) {
        // Si estamos en la primera familia y hay opción "Todas", ir a null
        onFamilyChange(null);
      }
    }
  };

  const handleNext = () => {
    if (!currentFamily) {
      // Si no hay familia seleccionada, ir a la primera
      onFamilyChange(familyGroups[0]);
    } else {
      const currentIndex = familyGroups.indexOf(currentFamily);
      if (currentIndex < familyGroups.length - 1) {
        onFamilyChange(familyGroups[currentIndex + 1]);
      }
    }
  };

  const isPreviousDisabled = (): boolean => {
    if (disabled) return true;
    if (!showAllOption) {
      return !currentFamily || familyGroups.indexOf(currentFamily) === 0;
    }
    return false; // Siempre permitir ir hacia atrás si hay opción "Todas"
  };

  const isNextDisabled = (): boolean => {
    if (disabled) return true;
    return Boolean(
      currentFamily &&
        familyGroups.indexOf(currentFamily) === familyGroups.length - 1
    );
  };

  // Calcular qué familias mostrar en la vista
  const getVisibleFamilies = () => {
    // Ajustar número de familias visibles según tamaño de pantalla
    const maxVisible = screenSize === "sm" ? 2 : screenSize === "md" ? 3 : 5;

    if (familyGroups.length <= maxVisible) {
      return familyGroups;
    }

    const currentIndex = currentFamily
      ? familyGroups.indexOf(currentFamily)
      : -1;

    if (currentIndex === -1) {
      // Si no hay familia seleccionada, mostrar las primeras
      return familyGroups.slice(0, maxVisible);
    }

    // Calcular el rango para mostrar elementos centrados en la selección actual
    const start = Math.max(
      0,
      Math.min(
        currentIndex - Math.floor(maxVisible / 2),
        familyGroups.length - maxVisible
      )
    );
    const end = Math.min(start + maxVisible, familyGroups.length);

    return familyGroups.slice(start, end);
  };
  const visibleFamilies = getVisibleFamilies();

  return (
    <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
      {/* Botón Anterior */}
      <button
        onClick={handlePrevious}
        disabled={isPreviousDisabled()}
        className={`p-2 sm:p-3 rounded font-semibold text-xs sm:text-sm lg:text-base flex-shrink-0 ${
          isPreviousDisabled()
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
      >
        <span className="hidden sm:inline">Anterior</span>
        <span className="sm:hidden">‹</span>
      </button>

      {/* Familias visibles */}
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="flex overflow-x-auto gap-1 sm:gap-2 pb-1 sm:pb-0 scrollbar-none">
          {/* Opción "Todas" si está habilitada */}
          {showAllOption && (
            <button
              onClick={() => onFamilyChange(null)}
              className={`p-2 sm:p-3 rounded text-xs sm:text-sm lg:text-base font-semibold flex-shrink-0 min-w-0 ${
                currentFamily === null
                  ? "bg-gray-400 text-white"
                  : "bg-gray-100 hover:bg-gray-300 text-gray-800"
              }`}
              disabled={disabled}
            >
              <span className="block truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px] lg:max-w-[150px]">
                {allOptionText}
              </span>
            </button>
          )}

          {/* Botones de familias */}
          {visibleFamilies.map((family) => (
            <button
              key={family}
              onClick={() => onFamilyChange(family)}
              className={`p-2 sm:p-3 rounded text-xs sm:text-sm lg:text-base font-semibold flex-shrink-0 min-w-0 ${
                currentFamily === family
                  ? "bg-gray-400 text-white"
                  : "bg-gray-100 hover:bg-gray-300 text-gray-800"
              }`}
              disabled={disabled}
            >
              <span className="block truncate max-w-[60px] sm:max-w-[80px] md:max-w-[120px] lg:max-w-[150px]">
                {family}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={handleNext}
        disabled={isNextDisabled()}
        className={`p-2 sm:p-3 rounded font-semibold text-xs sm:text-sm lg:text-base flex-shrink-0 ${
          isNextDisabled()
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-orange-500 hover:bg-orange-600 text-white"
        }`}
      >
        <span className="hidden sm:inline">Siguiente</span>
        <span className="sm:hidden">›</span>
      </button>
    </div>
  );
};

export default FamilyPagination;
