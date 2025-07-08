"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { LoginUserInput, LoginResponse } from "@/types/graphql";
import Cookies from "js-cookie";
import { useJwtStore } from "@/store/jwtStore";
import Alert from "@/components/Alert";
import { LOGIN_MUTATION } from "@/graphql/mutations";
import { validarRut } from "@/utils/validarRut";

export default function Login() {
  const [rut, setRut] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<
    "exitoso" | "error" | "advertencia"
  >("exitoso");
  const [alertMessage, setAlertMessage] = useState("");
  const router = useRouter();
  const { setToken, setRutUsuario, setRolUsuario, setNombreUsuario } =
    useJwtStore();

  const [login, { loading }] = useMutation<LoginResponse>(LOGIN_MUTATION, {
    onCompleted: (data) => {
      Cookies.set("token", data.login.access_token, { expires: 7 });
      Cookies.set("rol", data.login.user.rol, { expires: 7 });
      setToken(data.login.access_token);
      setRutUsuario(data.login.user.rut);
      setRolUsuario(data.login.user.rol);
      setNombreUsuario(data.login.user.nombre);
      router.push("/");
    },
    onError: (error) => {
      setShowAlert(true);
      if (error.graphQLErrors && error.graphQLErrors.length > 0) {
        setAlertType("error");
        setAlertMessage(
          error.graphQLErrors[0].message || "Credenciales inválidas"
        );
      } else {
        setAlertType("error");
        setAlertMessage(
          "Error al iniciar sesión. Por favor, intente nuevamente."
        );
      }
    },
  });

  const contieneCaracteresPeligrosos = (texto: string) => {
    const regex = /['";_]/;
    return regex.test(texto);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarRut(rut)) {
      setAlertType("advertencia");
      setAlertMessage("El RUT debe ser sin puntos y con guión.");
      setShowAlert(true);
      return;
    } else if (
      contieneCaracteresPeligrosos(rut) ||
      contieneCaracteresPeligrosos(contrasena)
    ) {
      setAlertType("error");
      setAlertMessage("No se permiten caracteres especiales en los campos.");
      setShowAlert(true);
      return;
    } else {
      try {
        await login({
          variables: {
            loginUserInput: {
              rut,
              contrasena,
            } as LoginUserInput,
          },
        });
      } catch (error) {
        setAlertType("error");
        setAlertMessage(
          "Error al iniciar sesión. Por favor, intente nuevamente."
        );
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 via-orange-300 to-yellow-200 py-4 px-4 sm:px-6 md:px-12">
      <div className="bg-white shadow-md rounded-lg py-6 sm:py-12 md:py-18 px-4 sm:px-6 w-full sm:w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4 max-w-md">
        {/* Columna Formulario */}
        <div className="col-span-1 flex flex-col justify-center mx-2 sm:mx-4 md:mx-8">
          <h1 className="text-2xl sm:text-3xl text-center font-bold text-gray-700">
            ¡Bienvenido!
          </h1>
          <p className="text-sm sm:text-base text-center text-gray-600 mt-2">
            Ingrese sus credenciales para el acceso al sistema.
          </p>
          {showAlert && (
            <div className="mt-4">
              <Alert
                type={alertType}
                message={alertMessage}
                onClose={() => setShowAlert(false)}
                modal={true}
              />
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {/* RUT */}
            <label className="block text-base sm:text-lg font-bold mb-2 mt-4">
              Rut
            </label>
            <div className="flex items-center border border-gray-300 rounded">
              <input
                type="text"
                placeholder="Ingrese su número de Rut"
                className="w-full px-3 py-2 text-sm sm:text-base focus:outline-none"
                value={rut}
                onChange={(e) => setRut(e.target.value.toLocaleUpperCase())}
                disabled={loading}
                required
              />
            </div>

            {/* Contraseña */}
            <label className="block text-base sm:text-lg font-bold mb-2 mt-4">
              Contraseña
            </label>
            <div className="flex items-center border border-gray-300 rounded relative">
              <input
                type={mostrarContrasena ? "text" : "password"}
                placeholder="Ingrese su contraseña"
                className="w-full px-3 py-2 text-sm sm:text-base focus:outline-none pr-12"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="absolute right-3 text-sm text-gray-300 hover:text-orange-500 p-1"
                onClick={() => setMostrarContrasena(!mostrarContrasena)}
              >
                {mostrarContrasena ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline w-5 h-5 sm:w-6 sm:h-6 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4.03-9-9s4-9 9-9c1.02 0 2.01.17 2.94.48M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19.07 4.93l-14.14 14.14"
                      />
                    </svg>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="inline w-5 h-5 sm:w-6 sm:h-6 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M1.458 12C2.732 7.943 6.523 5 12 5c5.477 0 9.268 2.943 10.542 7-1.274 4.057-5.065 7-10.542 7-5.477 0-9.268-2.943-10.542-7z"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                        stroke="currentColor"
                        strokeWidth={2}
                        fill="none"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* Botón Ingresar */}
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
  );
}
