"use client";
import React, { useState } from "react";
import Image from "next/image";

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded py-8 px-6">
        <div className="grid grid-cols-3 gap-4">
          {/* Columna Formulario */}
          <div className="col-span-1 flex flex-col justify-center mx-8">
            <h1 className="text-3xl text-center font-bold text-gray-700">
              Iniciar Sesión
            </h1>
            <div className="mt-6">
              <label className="block text-lg font-semi-bold text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <div className="flex items-center border border-gray-300 rounded">
                <input
                  type="text"
                  placeholder="Ingrese su correo"
                  className="w-full px-3 py-2 focus:outline-none"
                  //value={correo}
                  //onChange={(e) => setCorreo(e.target.value)}
                  //disabled={cargando}
                />
              </div>
              <div className="mt-6">
                <label className="block text-lg font-semi-bold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="flex items-center border border-gray-300 rounded">
                  <input
                    type="password"
                    placeholder="Ingrese su contraseña"
                    className="w-full px-3 py-2 focus:outline-none"
                    //value={contrasena}
                    //onChange={(e) => setContrasena(e.target.value)}
                    //disabled={cargando}
                  />
                </div>
                <button
                  className="mt-6 bg-amber-400 text-white font-bold py-2 px-4 rounded w-full hover:bg-amber-500 transition duration-300"
                  //onClick={handleSubmit}
                  //disabled={cargando}
                >
                  Ingresar
                </button>
              </div>
            </div>
          </div>
          {/* Columna Imagen */}
          <div className="col-span-2">
            <Image
              src="/login.png"
              alt="Imagen de inicio de sesión"
              width={800}
              height={200}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
