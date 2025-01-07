"use client";

import { useState } from "react";
import Link from "next/link";
import { IoClose } from "react-icons/io5"; // Iconos de menú hamburguesa
import { HiMenuAlt2 } from "react-icons/hi"; // Importa el nuevo ícono io5 IoClose
import Image from "next/image";

const Menu = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false); // Cierra el menú al seleccionar una opción
  };

  return (
    <div className="flex md:hidden justify-between items-center w-full">
      {/* Contenedor para dispositivos móviles */}
      {/* Ícono de menú hamburguesa alineado a la derecha */}
      <button onClick={toggleMenu} className="text-white">
        <HiMenuAlt2 size={30} />
      </button>
      {/* Menú desplegable en móviles */}
      {isOpen && (
        <div className="fixed top-0 left-0 w-1/2 h-full bg-gray-800 z-50 flex flex-col pl-6 pt-5">
          {/* Logo en la parte superior y ícono de cerrar dentro del menú */}
          <div className="flex justify-between items-center p-4">
            <Link href="/dashboard">
              <Image
                src="/logo-white.png"
                alt="Logo"
                width={180}
                height={180}
                className="mr-3"
              />
            </Link>
            <button onClick={toggleMenu} className="text-white">
              <IoClose size={40} /> {/* Ícono de cerrar dentro del menú */}
            </button>
          </div>
          {/* Opciones del menú */}
          <ul className="flex flex-col gap-y-4 p-4 flex-1 text-xl space-y-8">
            {!session?.user ? (
              <>
                <li>
                  <Link href="/" className="text-white" onClick={closeMenu}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/login"
                    className="text-white"
                    onClick={closeMenu}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/register"
                    className="text-white"
                    onClick={closeMenu}
                  >
                    Register
                  </Link>
                </li>
              </>
            ) : (
              <>
                {session?.user?.image === 1 ? (
                  <>
                    <li>
                      <Link
                        href="/dashboard/sales"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Ventas
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/ingredients"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Ingredientes
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/products"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Productos
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/IngredientInventory"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Inventario
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/openChecklist"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Apertura
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/providers"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Proveedores
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/api/auth/signout"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Logout
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <Link
                      href="/dashboard/IngredientInventory"
                      className="text-white"
                      onClick={closeMenu}
                    >
                      Inventario
                    </Link>
                    <Link
                      href="/dashboard/openChecklist"
                      className="text-white"
                      onClick={closeMenu}
                    >
                      Apertura
                    </Link>
                    <li>
                      <Link
                        href="/api/auth/signout"
                        className="text-white"
                        onClick={closeMenu}
                      >
                        Logout
                      </Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Menu;
