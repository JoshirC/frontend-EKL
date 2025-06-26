"use client";
import React, { useState } from "react";
import EnvioSugerencias from "@/components/envioSugerencias";
import Image from "next/image";
import { useJwtStore } from "@/store/jwtStore";
export default function Home() {
  const [openSugerencia, setOpenSugerencia] = useState(false);
  const { rolUsuario } = useJwtStore();

  return (
    <div className="font-sans bg-gray-100 text-neutral-800 min-h-screen flex flex-col">
      <EnvioSugerencias
        isOpen={openSugerencia}
        onClose={() => setOpenSugerencia(false)}
      />

      {/* HERO SECTION */}
      <div className="sm:bg-gradient-to-r sm:from-white sm:bg-orange-400 bg-orange-400 py-20 text-center sm:text-black text-white">
        <h1 className="sm:text-6xl font-extrabold sm:mb-8 text-4xl mb-4">
          Bienvenido a EKLIPSE
        </h1>
        <p className="sm:text-xl font-semibold sm:mb-12 text-lg">
          Sistema de gestión de inventario y adquisiciones incorcorado con el
          ERP Softland.
        </p>
      </div>

      {/* Modulos */}
      <section className="sm:p-16 p-4 py-10 bg-white ">
        <h2 className="text-3xl font-bold text-center mb-12">
          Módulos disponibles
        </h2>
        <div className="grid gap-8 md:grid-cols-2 px-16 sm:px-32 max-w-8xl mx-auto">
          <button
            className="bg-gray-50 p-6 rounded shadow text-center transition duration-300 hover:shadow-lg hover:bg-gray-200"
            onClick={() => {
              window.location.href = "/entrada/orden_compra";
            }}
          >
            <h3 className="font-bold text-2xl mt-3">Entrada de Productos</h3>
            <Image
              src="/home_page_ekl_1.png"
              alt="Imagen de Entrada de Productos"
              width={400}
              height={200}
              className="hidden sm:block items-center mx-auto mb-2"
            />
            <p className="text-lg mb-4">
              Registra el ingreso de los productos proporcionado por los
              proveedores.
            </p>
          </button>
          <button
            className="bg-gray-50 p-6 rounded shadow text-center transition duration-300 hover:shadow-lg hover:bg-gray-200"
            onClick={() => {
              window.location.href = "/salida/acopio_productos";
            }}
          >
            <h3 className="font-bold text-2xl mt-3">Acopio de Productos</h3>
            <Image
              src="/home_page_ekl_2.png"
              alt="Imagen de Entrada de Productos"
              width={400}
              height={200}
              className="hidden sm:block items-center mx-auto mb-2"
            />
            <p className="text-lg mb-4">
              Registra el acopio de productos provenientes de las órdenes de
              Acopio.
            </p>
          </button>
          {rolUsuario !== "Bodeguero" && (
            <button
              className="bg-gray-50 p-6 rounded shadow text-center transition duration-300 hover:shadow-lg hover:bg-gray-200"
              onClick={() => {
                window.location.href = "/adquisiciones/productos";
              }}
            >
              <h3 className="font-bold text-2xl mt-3">Gestión de Productos</h3>
              <Image
                src="/home_page_ekl_3.png"
                alt="Imagen de Entrada de Productos"
                width={400}
                height={200}
                className="hidden sm:block items-center mx-auto mb-2"
              />
              <p className="text-lg mb-4">
                Gestiona los productos disponibles en el inventario, incluyendo
                su trazabilidad.
              </p>
            </button>
          )}
          {rolUsuario !== "Bodeguero" && (
            <button
              className="bg-gray-50 p-6 rounded shadow text-center transition duration-300 hover:shadow-lg hover:bg-gray-200"
              onClick={() => {
                window.location.href = "/reporte/trazabilidad";
              }}
            >
              <h3 className="font-bold text-2xl mt-3">
                Registros de Trazabilidad
              </h3>
              <Image
                src="/home_page_ekl_4.png"
                alt="Imagen de Entrada de Productos"
                width={400}
                height={200}
                className="hidden sm:block items-center mx-auto mb-2"
              />
              <p className="text-lg mb-4">
                Verifica la trazabilidad de los productos desde su adquisición
                hasta su salida.
              </p>
            </button>
          )}
        </div>
      </section>

      {/* BOTÓN DE SUGERENCIAS */}
      <button
        className="sm:fixed sm:bottom-8 sm:right-8 bg-orange-400 text-white font-semibold p-6 sm:p-4 sm:rounded hover:bg-orange-500 transition duration-300 sm:w-auto whitespace-nowrap shadow-lg"
        onClick={() => setOpenSugerencia(true)}
      >
        Sugerencias
      </button>
      {/* FOOTER */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} EKLIPSE. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2">
            Desarrollado por Joshir Contreras Segovia.
          </p>
        </div>
      </footer>
    </div>
  );
}
