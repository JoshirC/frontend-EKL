"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function Login() {
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
            <div className="mt-4 sm:mt-6">
              <label className="block text-base sm:text-lg font-semi-bold text-gray-700 mb-2">
                Rut
              </label>
              <div className="flex items-center border border-gray-300 rounded">
                <input
                  type="text"
                  placeholder="Ingrese su número de Rut"
                  className="w-full px-3 py-2 text-sm sm:text-base focus:outline-none"
                  //value={correo}
                  //onChange={(e) => setCorreo(e.target.value)}
                  //disabled={cargando}
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
                  //value={contrasena}
                  //onChange={(e) => setContrasena(e.target.value)}
                  //disabled={cargando}
                />
              </div>
              <button
                className="mt-6 bg-orange-400 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded w-full transition duration-300 text-sm sm:text-base"
                //onClick={handleSubmit}
                //disabled={cargando}
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
