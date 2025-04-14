import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ModalState {
    rutUsuario: string | null;
    nombreUsuario: string | null;
    correoUsuario: string | null;
    rolUsuario: string | null;
    setRutUsuario: (rut: string | null) => void;
    setNombreUsuario: (nombre: string | null) => void;
    setCorreoUsuario: (correo: string | null) => void;
    setRolUsuario: (rol: string | null) => void;
    clearUsuario: () => void;
    
}

export const useModalStore = create<ModalState>()(
    persist(
        (set) => ({
            rutUsuario: null,
            nombreUsuario: null,
            correoUsuario: null,
            rolUsuario: null,
            setRutUsuario: (rut) => set({ rutUsuario: rut }),
            setNombreUsuario: (nombre) => set({ nombreUsuario: nombre }),
            setCorreoUsuario: (correo) => set({ correoUsuario: correo }),
            setRolUsuario: (rol) => set({ rolUsuario: rol }),
            clearUsuario: () =>
                set({
                    rutUsuario: null,
                    nombreUsuario: null,
                    correoUsuario: null,
                    rolUsuario: null,
                }),
        }),
        {
            name: "modal-storage", // unique name
        }
    )
);