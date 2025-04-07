"use client"; // Habilita este componente como un client component

import { usePathname } from "next/navigation";
import NavbarComponents from "./navbar"; // Tu navbar original

const NavbarClient = () => {
  const pathname = usePathname(); // Obtener la ruta actual

  // Rutas donde no se debe mostrar la navbar
  const hideNavbarRoutes = ["/auth/login", "/auth/register"];

  // Mostrar la navbar solo si la ruta no está en la lista de rutas a ocultar
  if (hideNavbarRoutes.includes(pathname)) {
    return null; // No mostrar la navbar
  }

  return <NavbarComponents />;
};

export default NavbarClient;
