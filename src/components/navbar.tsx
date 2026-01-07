"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import CambiarContraseña from "@/components/usuarios/cambiarContraseña";
import { useJwtStore } from "@/store/jwtStore";

const Navbar = () => {
  const [openEntrada, setOpenEntrada] = useState(false);
  const [openSalida, setOpenSalida] = useState(false);
  const [openMenuUsuario, setOpenMenuUsuario] = useState(false);
  const [openAdquisiciones, setOpenAdquisiciones] = useState(false);
  const [openProductos, setOpenProductos] = useState(false);
  const [modalCambiarContraseña, setModalCambiarContraseña] = useState(false);
  const [openReporte, setOpenReporte] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { rutUsuario, rolUsuario, nombreUsuario } = useJwtStore();

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
    setOpenProductos(false);
  };

  const handleOpenSalida = () => {
    setOpenSalida(!openSalida);
    setOpenEntrada(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
    setOpenProductos(false);
  };

  const handleOpenMenuUsuario = () => {
    setOpenMenuUsuario(!openMenuUsuario);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
    setOpenProductos(false);
  };

  const handleOpenAdquisiciones = () => {
    setOpenAdquisiciones(!openAdquisiciones);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenReporte(false);
    setOpenProductos(false);
  };
  const handleOpenProductos = () => {
    setOpenProductos(!openProductos);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
  };

  const handleOpenReporte = () => {
    setOpenReporte(!openReporte);
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenProductos(false);
  };

  const handleCloseMenu = () => {
    setOpenEntrada(false);
    setOpenSalida(false);
    setOpenMenuUsuario(false);
    setOpenAdquisiciones(false);
    setOpenReporte(false);
    setOpenProductos(false);
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
    <header className="sm: bg-gradient-to-r sm:from-white sm:bg-orange-400 bg-orange-400 sticky top-0 z-50">
      <div className=" mx-auto px-4 sm:px-8 lg:px-6">
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
            {["Administrador", "Soporte"].includes(rolUsuario ?? "") && (
              <Link href="/usuarios">
                <div className="text-black font-semibold hover:text-gray-100 transition duration-300">
                  Usuarios
                </div>
              </Link>
            )}
            {/* Centros de Costos */}
            {["Administrador", "Soporte"].includes(rolUsuario ?? "") && (
              <Link href="/centros">
                <div className="text-black font-semibold hover:text-gray-100 transition duration-300">
                  Centros
                </div>
              </Link>
            )}
            {/* Adquisiciones */}
            {!["Jefe Bodega", "Bodeguero"].includes(rolUsuario ?? "") && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenAdquisiciones}
                  className="text-black font-semibold hover:text-gray-100 transition duration-300 flex items-center gap-1"
                >
                  Adquisiciones
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAdquisiciones ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openAdquisiciones && (
                  <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <Link href="/adquisiciones/consolidado">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Solicitud de Abastecimiento
                      </div>
                    </Link>
                    <Link href="/adquisiciones/acopio">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Orden Acopio
                      </div>
                    </Link>
                    <Link href="/adquisiciones/guias_entrada">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Guías de Entrada
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
            {/* Productos */}
            {!["Bodeguero"].includes(rolUsuario ?? "") && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenProductos}
                  className="text-black font-semibold hover:text-gray-100 transition duration-300 flex items-center gap-1"
                >
                  Productos
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openProductos ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openProductos && (
                  <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <Link href="/producto/productos">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Productos
                      </div>
                    </Link>
                    <Link href="/producto/orden_compra">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Ordenes de Compra
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}
            {/* Entrada */}
            {!["Adquisiciones", "Bodeguero"].includes(rolUsuario ?? "") && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenEntrada}
                  className="text-black font-semibold hover:text-gray-100 transition duration-300 flex items-center gap-1"
                >
                  Entrada
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openEntrada ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openEntrada && (
                  <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <Link href="/entrada/orden_compra">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Ingreso de Productos
                      </div>
                    </Link>
                    <Link href="/entrada/carga_softland">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Carga Masiva Softland
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Salida */}
            {!["Adquisiciones"].includes(rolUsuario ?? "") && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenSalida}
                  className="text-black font-semibold hover:text-gray-100 transition duration-300 flex items-center gap-1"
                >
                  Salida
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openSalida ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openSalida && (
                  <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <Link href="/salida/acopio_productos">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Acopio de Productos
                      </div>
                    </Link>
                    {!["Bodeguero"].includes(rolUsuario ?? "") && (
                      <>
                        <Link href="/salida/carga_softland">
                          <div
                            className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                            onClick={handleSelectOption}
                          >
                            Carga Masiva Softland
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reporte */}
            {!["Jefe Bodega", "Bodeguero"].includes(rolUsuario ?? "") && (
              <div className="relative flex justify-center">
                <button
                  onClick={handleOpenReporte}
                  className="text-black font-semibold hover:text-gray-100 transition duration-300 flex items-center gap-1"
                >
                  Reporte
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openReporte ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openReporte && (
                  <div className="mt-10 w-35 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                    <Link href="/reporte/consolidado">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Consolidados
                      </div>
                    </Link>
                    <Link href="/reporte/registro_acopio">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Registro Acopio
                      </div>
                    </Link>
                    <Link href="/reporte/trazabilidad">
                      <div
                        className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                        onClick={handleSelectOption}
                      >
                        Trazabilidad
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Datos Usuario */}
            <div className="relative flex justify-center">
              <button
                className="bg-black text-orange-400 rounded-lg flex items-center justify-center hover:bg-white hover:text-orange-400 transition duration-300 px-4 py-2 font-semibold gap-2"
                onClick={handleOpenMenuUsuario}
              >
                {nombreUsuario?.split(" ")[0]}
                {/* Dropdown Icon */}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openMenuUsuario ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openMenuUsuario && (
                <div className="mt-12 w-35 right-0 bg-orange-300 text-l text-black shadow-lg rounded-md sm:absolute">
                  <div
                    onClick={() => {
                      abrirModalCambiarContraseña();
                      handleSelectOption();
                    }}
                    className="block px-4 py-2 hover:bg-orange-200 rounded-md cursor-pointer"
                  >
                    Cambiar Contraseña
                  </div>
                  <div
                    className="block px-4 py-2 hover:bg-orange-200 rounded-md cursor-pointer"
                    onClick={() => {
                      document.cookie =
                        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                      useJwtStore.getState().clearStore();
                      handleSelectOption();
                      window.location.href = "/auth/login";
                    }}
                  >
                    Salir
                  </div>
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
              {["Administrador", "Soporte"].includes(rolUsuario ?? "") && (
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
              {!["Jefe Bodega", "Bodeguero"].includes(rolUsuario ?? "") && (
                <div>
                  <button
                    onClick={handleOpenAdquisiciones}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                  >
                    Adquisiciones
                  </button>
                  {openAdquisiciones && (
                    <div className="pl-4">
                      <Link href="/adquisiciones/consolidado">
                        <div
                          className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          Solicitud de Abastecimiento
                        </div>
                      </Link>
                      <Link href="/adquisiciones/acopio">
                        <div
                          className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          Orden Acopio
                        </div>
                      </Link>
                      <Link href="/adquisiciones/productos">
                        <div
                          className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          Productos
                        </div>
                      </Link>
                      <Link href="/adquisiciones/guias_entrada">
                        <div
                          className="block px-4 py-2 hover:bg-orange-200 rounded-md"
                          onClick={handleSelectOption}
                        >
                          Guías de Entrada
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Entrada */}
              {!["Adquisiciones", "Bodeguero"].includes(rolUsuario ?? "") && (
                <div>
                  <button
                    onClick={handleOpenEntrada}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                  >
                    Entrada
                  </button>
                  {openEntrada && (
                    <div className="pl-4">
                      <Link href="/entrada/orden_compra">
                        <div
                          className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          Ingreso de Productos
                        </div>
                      </Link>

                      <Link href="/entrada/revision">
                        <div
                          className="block px-4 py-2 text-black font-medium hover:bg-orange-300 rounded-md"
                          onClick={handleSelectOption}
                        >
                          Revisión guia de Entrada
                        </div>
                      </Link>
                      {!["Bodeguero"].includes(rolUsuario ?? "") && (
                        <Link href="/entrada/carga_softland">
                          <div
                            className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                            onClick={handleSelectOption}
                          >
                            Carga Masiva Softland
                          </div>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Salida */}
              {!["Adquisiciones"].includes(rolUsuario ?? "") && (
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
                          Acopio de Productos
                        </div>
                      </Link>
                      {!["Bodeguero"].includes(rolUsuario ?? "") && (
                        <>
                          <Link href="/salida/revision">
                            <div
                              className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                              onClick={handleSelectOption}
                            >
                              Revisión
                            </div>
                          </Link>
                          <Link href="/salida/carga_softland">
                            <div
                              className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                              onClick={handleSelectOption}
                            >
                              Carga Masiva Softland
                            </div>
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Reporte */}
              {!["Jefe Bodega", "Bodeguero"].includes(rolUsuario ?? "") && (
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
                          Registro Acopio
                        </div>
                      </Link>
                      <Link href="/reporte/trazabilidad">
                        <div
                          className="block px-4 py-2 hover:bg-orange-200"
                          onClick={handleSelectOption}
                        >
                          Trazabilidad
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Datos Usuario */}
              <div>
                <button
                  onClick={handleOpenMenuUsuario}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                >
                  {nombreUsuario?.split(" ")[0]}
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
                      Cambiar Contraseña
                    </div>
                    <div>
                      <Link
                        href="/auth/login"
                        className="block px-3 py-2 text-base font-medium text-black hover:bg-orange-300 rounded-md"
                        onClick={() => {
                          document.cookie =
                            "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                          useJwtStore.getState().clearStore();
                          handleSelectOption();
                        }}
                      >
                        Salir
                      </Link>
                    </div>
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
        rutUsuario={rutUsuario ?? ""}
        nombreUsuario={nombreUsuario ?? ""}
      />
    </header>
  );
};

export default Navbar;
