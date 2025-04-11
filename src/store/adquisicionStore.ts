import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdquisicionState {
    idAcopio: number | null;
    setIdAcopio: (id: number | null) => void;
    clearIdAcopio: () => void;
    estadoOrdenAcopio: string | null;
    setEstadoOrdenAcopio: (estado: string | null) => void;
    clearEstadoOrdenAcopio: () => void;


    idOrdenAcopio: number | null;
    setIdOrdenAcopio: (id: number | null) => void;
    clearIdOrdenAcopio: () => void;

}
export const useAdquisicionStore = create<AdquisicionState>()(
    persist(
        (set) => ({
            idAcopio: null,
            setIdAcopio: (id) => set({ idAcopio: id }),
            clearIdAcopio: () => set({ idAcopio: null }),
            estadoOrdenAcopio: null,
            setEstadoOrdenAcopio: (estado) => set({ estadoOrdenAcopio: estado }),
            clearEstadoOrdenAcopio: () => set({ estadoOrdenAcopio: null }),

            idOrdenAcopio: null,
            setIdOrdenAcopio: (id) => set({ idOrdenAcopio: id }),
            clearIdOrdenAcopio: () => set({ idOrdenAcopio: null }),

        }),
        {
            name: 'adquisicion-storage', // unique name
        }
    )
);