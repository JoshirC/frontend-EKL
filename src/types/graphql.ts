export interface LoginUserInput {
  rut: string;
  contrasena: string;
}

export interface User {
  id: string;
  rut: string;
  nombre: string;
  correo: string;
  rol: string;
}

export interface LoginResponse {
  login: {
    access_token: string;
    user: User;
  };
} 

export type Producto = {
  id: number;
  codigo: string;
  nombre_producto: string;
  familia: string;
  unidad_medida: string;
  precio_unitario?: number;
  cantidad: number;
  cantidad_softland: number;
  trazabilidad: boolean;
}