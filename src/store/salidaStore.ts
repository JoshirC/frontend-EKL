import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SalidaState {
    idAcopio : number | null;
    centroCosto : string | null;
    fecha : string | null;
    estado : string | null;
    setIdAcopio: (id: number | null) => void;
    setCentroCosto: (centro: string | null) => void;
    setFecha: (fecha: string | null) => void;
    setEstado: (estado: string | null) => void;

    clearData: () => void;

}

export const useSalidaStore = create<SalidaState>()(
    persist(
        (set) => ({
            idAcopio: null,
            centroCosto: null,
            fecha: null,
            estado: null,
            setIdAcopio: (id) => set({ idAcopio: id }),
            setCentroCosto: (centro) => set({ centroCosto: centro }),
            setFecha: (fecha) => set({ fecha: fecha }),
            setEstado: (estado) => set({ estado: estado }),

            clearData: () =>
                set({
                    idAcopio: null,
                    centroCosto: null,
                    fecha: null,
                    estado: null,
                }),
        }),
        {
            name: "salida-storage", // unique name
        }
    )
);

