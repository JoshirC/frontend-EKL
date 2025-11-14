"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { GET_PALLETS_BY_ORDEN_ACOPIO } from "@/graphql/query";
import Alert from "../Alert";
import { Pallet } from "@/types/graphql";
import { generarPalletPdf } from "@/types/generarPalletPDF";
interface ModalImpresionPalletProps {
  isOpen: boolean;
  idOrdenAcopio: string;
  nombreCC: string;
  onClose: () => void;
}
const ModalImpresionPallet: React.FC<ModalImpresionPalletProps> = ({
  isOpen,
  idOrdenAcopio,
  nombreCC,
  onClose,
}) => {
  const { loading, error, data } = useQuery(GET_PALLETS_BY_ORDEN_ACOPIO, {
    variables: { ordenAcopioId: idOrdenAcopio },
  });
  const [palletSeleccionado, setPalletSeleccionado] = useState<Pallet | null>(
    null
  );
  const handleGenerarPDF = () => {
    if (palletSeleccionado) {
      generarPalletPdf(palletSeleccionado, nombreCC);
    }
  };
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);
  if (!isOpen) return null;

  const palletsOrden: Pallet[] = data?.palletsByOrdenAcopio || [];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 px-4">
      <div className="bg-white rounded shadow-xl max-w-xl w-full mx-4 max-h-[60vh] overflow-hidden">
        {/* Header del modal */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Impresión de Pallet</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Selecciona el pallet que deseas imprimir.
          </p>
        </div>
        {/* Selector de Pallet */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2 p-5">
          {palletsOrden.map((pallet) => (
            <button
              key={pallet.id}
              onClick={() => setPalletSeleccionado(pallet)}
              className={`px-4 py-2 rounded font-medium transition-all duration-200 ${
                palletSeleccionado?.numero_pallet === pallet.numero_pallet
                  ? "bg-orange-400 text-white shadow-md"
                  : "bg-gray-300 text-gray-500 hover:bg-orange-400 hover:text-white"
              }`}
            >
              {pallet.numero_pallet}
            </button>
          ))}
        </div>
        {/* Botón para generar PDF */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
          <button
            onClick={handleGenerarPDF}
            className="bg-orange-400 text-white font-semibold px-4 py-2 rounded hover:bg-orange-500 transition-colors"
            disabled={!palletSeleccionado}
          >
            Generar PDF
          </button>
        </div>
      </div>
    </div>
  );
};
export default ModalImpresionPallet;
