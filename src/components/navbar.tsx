"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CambiarContraseña from "@/components/usuarios/cambiarContraseña";

const Navbar = () => {
  const [openEntrada, setOpenEntrada] = useState(false);
  const [openSalida, setOpenSalida] = useState(false);
  const [openMenuUsuario, setOpenMenuUsuario] = useState(false);
  const [openAdquisiciones, setOpenAdquisiciones] = useState(false);
  const [modalCambiarContraseña, setModalCambiarContraseña] = useState(false);
  const [openReporte, setOpenReporte] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userRole = "Administrador"; // Cambiar según el rol del usuario
  const rutUsuario = "[tomar del login]";
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenEntrada = () => {
    setOpenEntrada(!openEntrada);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
  };
  const handleOpenSalida = () => {
    setOpenSalida(!openSalida);
    setOpenEntrada(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
  };
  const handleOpenMenuUsuario = () => {
    setOpenMenuUsuario(!openMenuUsuario);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
  };
  const handleOpenAdquisiciones = () => {
    setOpenAdquisiciones(!openAdquisiciones);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenReporte(false);
  };
  const handleOpenReporte = () => {
    setOpenReporte(!openReporte);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
  };
  const handleCloseMenu = () => {
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
  };

  const abrirModalCambiarContraseña = () => {
    setModalCambiarContraseña(true);
    handleCloseMenu();
  };

  const cerrarModalCambiarContraseña = () => {
    setModalCambiarContraseña(false);
  };

  {
    /* Roles: Administrador, Adquisiciones, Jefe Bodega, Bodeguero */
  }
  return (
    <header className="bg-gradient-to-r from-white to-orange-400 shadow-md sticky top-0 z-50">
      {/* Navbar Container */}
      <div className="mx-auto max-w-screen px-4" ref={menuRef}>
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={150}
              height={10}
              className="h-auto w-auto"
            />
          </Link>
          <div className="flex items-center space-x-16">
            {/* Usuarios */}
            {["Administrador"].includes(userRole) && (
              <Link href="/usuarios">
                <div className="text-black font-semibold text-lg">Usuarios</div>
              </Link>
            )}
            {/* Adquisiciones */}
            <div className="relative flex justify-center">
              {!["Jefe Bodega", "Bodeguero"].includes(userRole) && (
                <button
                  onClick={handleOpenAdquisiciones}
                  className="text-black font-semibold text-lg"
                >
                  Adquisiciones
                </button>
              )}
              {/* Dropdown Menu Adquisiciones */}
              {openAdquisiciones && (
                <ul className="mt-10 w-30 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                  <li className="px-4 py-2 hover:bg-orange-200">
                    <Link href="/adquisiciones/acopio">
                      <div onClick={handleCloseMenu}> Ordenes de Acopio</div>
                    </Link>
                  </li>
                </ul>
              )}
            </div>

            {/* Entrada */}
            <div className="relative flex justify-center">
              <button
                onClick={handleOpenEntrada}
                className="text-black font-semibold text-lg"
              >
                Entrada
              </button>
              {/* Dropdown Menu Entrada */}
              {openEntrada && (
                <ul className="mt-10 w-30 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                  <li className="px-4 py-2 hover:bg-orange-200">
                    <Link href="/entrada/productos">
                      <div onClick={handleCloseMenu}>Ingreso de Productos</div>
                    </Link>
                  </li>
                  {!["Bodeguero"].includes(userRole) && (
                    <ul>
                      <li className="px-4 py-2 hover:bg-orange-200">
                        <Link href="/entrada/carga">Carga Masiva</Link>
                      </li>
                    </ul>
                  )}
                </ul>
              )}
            </div>
            {/* Salida */}
            <div className="relative flex justify-center">
              <button
                onClick={handleOpenSalida}
                className="text-black font-semibold text-lg"
              >
                Salida
              </button>
              {/* Dropdown Menu Salida */}
              {openSalida && (
                <ul className="mt-10 w-30 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                  <li className="px-4 py-2 hover:bg-orange-200">
                    <Link href="/salida/acopio_productos">
                      <div onClick={handleCloseMenu}>Acopio de Productos</div>
                    </Link>
                  </li>
                  {!["Bodeguero"].includes(userRole) && (
                    <ul>
                      <li className="px-4 py-2 hover:bg-orange-200">
                        <Link href="/salida/revision">
                          <div onClick={handleCloseMenu}>Revisión</div>
                        </Link>
                      </li>
                      <li className="px-4 py-2 hover:bg-orange-200">
                        <Link href="/salida/carga_softland">
                          <div onClick={handleCloseMenu}>Carga Softland</div>
                        </Link>
                      </li>
                    </ul>
                  )}
                </ul>
              )}
            </div>
            {/* Reporte */}
            {!["Bodeguero", "Jefe Bodega"].includes(userRole) && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenReporte}
                  className="text-black font-semibold text-lg"
                >
                  Reporte
                </button>
                {/* Dropdown Menu Reporte */}
                {openReporte && (
                  <ul className="mt-10 w-30 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <li className="px-4 py-2 hover:bg-orange-200">
                      <Link href="/reporte/registro_acopio">
                        <div onClick={handleCloseMenu}>Registro Acopio</div>
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            )}

            {/* Datos Usuario */}
            <div className="relative flex justify-center mr-12">
              <button
                className="w-10 h-10 bg-black text-orange-400 rounded-full flex items-center justify-center"
                onClick={handleOpenMenuUsuario}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9A3.75 3.75 0 1112 5.25 3.75 3.75 0 0115.75 9zM4.5 19.5a8.25 8.25 0 0115 0"
                  />
                </svg>
              </button>
              {/* Dropdown Menu Datos Usuario */}
              {openMenuUsuario && (
                <ul className="mt-10 w-30 bg-orange-400 text-l text-black shadow-lg rounded-md sm:absolute">
                  <li className="px-4 py-2 hover:bg-orange-200">
                    <div
                      onClick={abrirModalCambiarContraseña}
                      className="cursor-pointer"
                    >
                      Cambiar Contraseña
                    </div>
                  </li>
                  <li className="px-4 py-2 hover:bg-orange-200">
                    <Link href="/usuario/salir">
                      <div onClick={handleCloseMenu}>Salir</div>
                    </Link>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      <CambiarContraseña
        isOpen={modalCambiarContraseña}
        onClose={cerrarModalCambiarContraseña}
        rutUsuario={rutUsuario}
      />
    </header>
  );
};
export default Navbar;
