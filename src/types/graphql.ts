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