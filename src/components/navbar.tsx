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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userRole = "Administrador"; // Cambiar según el rol del usuario
  const rutUsuario = "[tomar del login]";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseMenu();
        setIsMobileMenuOpen(false);
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

  const handleSelectOption = () => {
    handleCloseMenu();
    setIsMobileMenuOpen(false);
  };

  const abrirModalCambiarContraseña = () => {
    setModalCambiarContraseña(true);
    handleCloseMenu();
  };

  const cerrarModalCambiarContraseña = () => {
    setModalCambiarContraseña(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sm: bg-gradient-to-r sm:from-white sm:bg-orange-400 bg-orange-400 shadow-md sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo_ekl_color.png"
              alt="Logo"
              width={150}
              height={1}
              className="hidden sm:block"
            />
            <Image
              src="/logo_ekl.png"
              alt="Logo"
              width={150}
              height={1}
              className="block sm:hidden"
            />
          </Link>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white focus:outline-none"
            >
              <span className="sr-only">Abrir menú principal</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* Usuarios */}
            {["Administrador"].includes(userRole) && (
              <Link href="/usuarios">
                <div className="text-black font-semibold hover:text-gray-100 transition duration-300">
                  Usuarios
                </div>
              </Link>
            )}

            {/* Adquisiciones */}
            {!["Jefe Bodega", "Bodeguero"].includes(userRole) && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenAdquisiciones}
                  className="text-black font-semibold hover:text-gray-100 transition duration-300"
                >
                  Adquisiciones
                </button>
                {openAdquisiciones && (
                  <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <Link href="/adquisiciones/acopio">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200"
                        onClick={handleSelectOption}
                      >
                        Ordenes de Acopio
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Entrada */}
            <div className="relative flex justify-center">
              <button
                onClick={handleOpenEntrada}
                className="text-black font-semibold hover:text-white transition duration-300"
              >
                Entrada
              </button>
              {openEntrada && (
                <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                  <Link href="/entrada/productos">
                    <div
                      className="block px-4 py-2 hover:bg-orange-200"
                      onClick={handleSelectOption}
                    >
                      Ingreso de Productos
                    </div>
                  </Link>
                  {!["Bodeguero"].includes(userRole) && (
                    <Link href="/entrada/carga">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200"
                        onClick={handleSelectOption}
                      >
                        Carga Masiva
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Salida */}
            <div className="relative flex justify-center">
              <button
                onClick={handleOpenSalida}
                className="text-black font-semibold hover:text-white transition duration-300"
              >
                Salida
              </button>
              {openSalida && (
                <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                  <Link href="/salida/acopio_productos">
                    <div
                      className="block px-4 py-2 hover:bg-orange-200"
                      onClick={handleSelectOption}
                    >
                      Acopio de Productos
                    </div>
                  </Link>
                  {!["Bodeguero"].includes(userRole) && (
                    <>
                      <Link href="/salida/revision">
                        <div
                          className="block px-4 py-2 hover:bg-orange-200"
                          onClick={handleSelectOption}
                        >
                          Revisión
                        </div>
                      </Link>
                      <Link href="/salida/carga_softland">
                        <div
                          className="block px-4 py-2 hover:bg-orange-200"
                          onClick={handleSelectOption}
                        >
                          Carga Softland
                        </div>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Reporte */}
            <div className="relative flex justify-center">
              <button
                onClick={handleOpenReporte}
                className="text-black font-semibold hover:text-white transition duration-300"
              >
                Reporte
              </button>
              {openReporte && (
                <div className="mt-10 w-35 bg-orange-400 text-l text-black shadow-lg rounded-md sm:absolute">
                  <Link href="/reporte/registro_acopio">
                    <div
                      className="block px-4 py-2 hover:bg-orange-200"
                      onClick={handleSelectOption}
                    >
                      Registro Acopio
                    </div>
                  </Link>
                </div>
              )}
            </div>

            {/* Datos Usuario */}
            <div className="relative flex justify-center">
              <button
                className="w-8 h-8 lg:w-10 lg:h-10 bg-black text-orange-400 rounded-full flex items-center justify-center hover:bg-white hover:text-orange-400 transition duration-300"
                onClick={handleOpenMenuUsuario}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4 lg:w-6 lg:h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9A3.75 3.75 0 1112 5.25 3.75 3.75 0 0115.75 9zM4.5 19.5a8.25 8.25 0 0115 0"
                  />
                </svg>
              </button>
              {openMenuUsuario && (
                <div className="mt-12 w-35 right-0 bg-orange-400 text-l text-black shadow-lg rounded-md sm:absolute">
                  <div
                    onClick={() => {
                      abrirModalCambiarContraseña();
                      handleSelectOption();
                    }}
                    className="block px-4 py-2 hover:bg-orange-200 rounded-md cursor-pointer"
                  >
                    Cambiar Contraseña
                  </div>
                  <Link href="/usuario/salir">
                    <div
                      className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                      onClick={handleSelectOption}
                    >
                      Salir
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden rounded-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Usuarios */}
              {["Administrador"].includes(userRole) && (
                <Link href="/usuarios">
                  <div
                    className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                    onClick={handleSelectOption}
                  >
                    Usuarios
                  </div>
                </Link>
              )}

              {/* Adquisiciones */}
              {!["Jefe Bodega", "Bodeguero"].includes(userRole) && (
                <div>
                  <button
                    onClick={handleOpenAdquisiciones}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                  >
                    Adquisiciones
                  </button>
                  {openAdquisiciones && (
                    <div className="pl-4">
                      <Link href="/adquisiciones/acopio">
                        <div
                          className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          ▶ Ordenes de Acopio
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Entrada */}
              <div>
                <button
                  onClick={handleOpenEntrada}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                >
                  Entrada
                </button>
                {openEntrada && (
                  <div className="pl-4">
                    <Link href="/entrada/productos">
                      <div
                        className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                        onClick={handleSelectOption}
                      >
                        ▶ Ingreso de Productos
                      </div>
                    </Link>
                    {!["Bodeguero"].includes(userRole) && (
                      <Link href="/entrada/carga">
                        <div
                          className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          ▶ Carga Masiva
                        </div>
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Salida */}
              <div>
                <button
                  onClick={handleOpenSalida}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                >
                  Salida
                </button>
                {openSalida && (
                  <div className="pl-4">
                    <Link href="/salida/acopio_productos">
                      <div
                        className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                        onClick={handleSelectOption}
                      >
                        ▶ Acopio de Productos
                      </div>
                    </Link>
                    {!["Bodeguero"].includes(userRole) && (
                      <>
                        <Link href="/salida/revision">
                          <div
                            className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                            onClick={handleSelectOption}
                          >
                            ▶ Revisión
                          </div>
                        </Link>
                        <Link href="/salida/carga_softland">
                          <div
                            className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                            onClick={handleSelectOption}
                          >
                            ▶ Carga Softland
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Reporte */}
              <div>
                <button
                  onClick={handleOpenReporte}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                >
                  Reporte
                </button>
                {openReporte && (
                  <div className="pl-4">
                    <Link href="/reporte/registro_acopio">
                      <div
                        className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                        onClick={handleSelectOption}
                      >
                        ▶ Registro Acopio
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Datos Usuario */}
              <div>
                <button
                  onClick={handleOpenMenuUsuario}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                >
                  Mi Cuenta
                </button>
                {openMenuUsuario && (
                  <div className="pl-4">
                    <div
                      onClick={() => {
                        abrirModalCambiarContraseña();
                        handleSelectOption();
                      }}
                      className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md cursor-pointer"
                    >
                      ▶ Cambiar Contraseña
                    </div>
                    <Link href="/usuario/salir">
                      <div
                        className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                        onClick={handleSelectOption}
                      >
                        ▶ Salir
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
