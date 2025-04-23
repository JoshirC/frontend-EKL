"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useRouter } from "next/navigation";
import { LoginUserInput, LoginResponse } from "@/types/graphql";
import Cookies from "js-cookie";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "@/components/Alert";

const LOGIN_MUTATION = gql`
  mutation Login($loginUserInput: LoginUserInput!) {
    login(loginUserInput: $loginUserInput) {
      access_token
      user {
        rut
        rol
      }
    }
  }
`;

export default function Login() {
  const [rut, setRut] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const { setToken, setRutUsuario, setRolUsuario } = useJwtStore();

  const [login, { loading }] = useMutation<LoginResponse>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      Cookies.set("token", data.login.access_token, { expires: 7 }); // Expira en 7 días
      Cookies.set("rol", data.login.user.rol, { expires: 7 }); // Guardar rol en cookies
      setToken(data.login.access_token);
      setRutUsuario(data.login.user.rut);
      setRolUsuario(data.login.user.rol);
      router.push("/");
    },
    onError: (error) => {
      setShowAlert(true);
      if (error.networkError) {
        setError("Error de conexión. Por favor, intente nuevamente.");
      } else if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        // Usar el mensaje de error del servidor si está disponible
        setError(error.graphQLErrors[0].message || "Credenciales inválidas");
      } else {
        setError("Error al iniciar sesión. Por favor, intente nuevamente.");
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowAlert(false);
    setTimeout(() => {
      setShowAlert(true);
    }, 1000);

    try {
      console.log("Intentando login con:", { rut, contrasena });
      const result = await login({
        variables: {
          loginUserInput: {
            rut,
            contrasena,
          } as LoginUserInput,
        },
      });
      console.log("Resultado del login:", result);
    } catch (error) {
      console.error("Error en el login:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="bg-white shadow-md rounded-lg py-6 sm:py-8 px-4 sm:px-6 w-full max-w-6xl">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Columna Imagen - Ahora arriba en móvil */}
          <div className="col-span-1 lg:col-span-2 flex items-center justify-center order-first lg:order-last">
            <div className="relative w-full h-48 sm:h-64 lg:h-96">
              <Image
                src="/login.png"
                alt="Imagen de inicio de sesión"
                fill
                className="rounded-lg shadow-lg object-cover"
                priority
              />
            </div>
          </div>
          {/* Columna Formulario */}
          <div className="col-span-1 flex flex-col justify-center mx-4 sm:mx-8">
            <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-700">
              Iniciar Sesión
            </h1>
            {showAlert && (
              <Alert
                type="error"
                message={error}
                onClose={() => setShowAlert(false)}
              />
            )}
            <form onSubmit={handleSubmit} className="mt-4 sm:mt-6">
              <label className="block text-base sm:text-lg font-semi-bold text-gray-700 mb-2">
                Rut
              </label>
              <div className="flex items-center border border-gray-300 rounded">
                <input
                  type="text"
                  placeholder="Ingrese su número de Rut"
                  className="w-full px-3 py-2 text-sm sm:text-base focus:outline-none"
                  value={rut}
                  onChange={(e) => setRut(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <label className="block text-base sm:text-lg font-semi-bold text-gray-700 mb-2 mt-4">
                Contraseña
              </label>
              <div className="flex items-center border border-gray-300 rounded">
                <input
                  type="password"
                  placeholder="Ingrese su contraseña"
                  className="w-full px-3 py-2 text-sm sm:text-base focus:outline-none"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <button
                type="submit"
                className="mt-6 bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded w-full transition duration-300 text-sm sm:text-base disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Ingresar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
