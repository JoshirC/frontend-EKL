import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JwtStore {
    token: string | null;
    setToken: (token: string | null) => void;
    nombreUsuario: string | null;
    setNombreUsuario: (nombre: string | null) => void;
    rutUsuario: string | null;
    setRutUsuario: (rut: string | null) => void;
    rolUsuario: string | null;
    setRolUsuario: (rol: string | null) => void;

    clearStore: () => void;
}

export const useJwtStore = create<JwtStore>()(
    persist(
        (set) => ({
            token: null,
            setToken: (token) => set({ token }),
            nombreUsuario: null,
            setNombreUsuario: (nombre) => set({ nombreUsuario: nombre }),
            rutUsuario: null,
            setRutUsuario: (rut) => set({ rutUsuario: rut }),
            rolUsuario: null,
            setRolUsuario: (rol) => set({ rolUsuario: rol }),
            clearStore: () => set({ token: null, rutUsuario: null, rolUsuario: null, nombreUsuario: null }),
        }),
        {
            name: "jwt-storage",
        }
    )
);

