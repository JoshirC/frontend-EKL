"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";

const Navbar = () => {
  return (
    <header className="bg-amber-400 shadow-md sticky top-0 z-50">
      {/* Navbar Container */}
      <div className="mx-auto max-w-screen px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <Link href="/">
            <div className="text-white text-xl font-bold">
              EKLIPSE SERVICIOS
            </div>
          </Link>
          <div className="flex items-center space-x-10">
            {/* Usuarios */}
            <Link href="/usuarios">
              <div className="text-black font-bold text-lg">Usuarios</div>
            </Link>
            {/* Guia Entrada */}
            <Link href="/guia-entrada">
              <div className="text-black font-bold text-lg">Guia Entrada</div>
            </Link>
            {/* Guia Salida */}
            <Link href="/guia-salida">
              <div className="text-black font-bold text-lg">Guia Salida</div>
            </Link>
            {/* Trazabilidad */}
            <Link href="/trazabilidad">
              <div className="text-black font-bold text-lg">Trazabilidad</div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
