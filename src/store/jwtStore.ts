import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JwtStore {
    token: string | null;
    setToken: (token: string | null) => void;
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
            rutUsuario: null,
            setRutUsuario: (rut) => set({ rutUsuario: rut }),
            rolUsuario: null,
            setRolUsuario: (rol) => set({ rolUsuario: rol }),
            clearStore: () => set({ token: null, rutUsuario: null, rolUsuario: null }),
        }),
        {
            name: "jwt-storage",
        }
    )
);

