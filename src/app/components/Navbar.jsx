import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Image from "next/image";
import MenuToggle from "./Menu"; // Importa el componente del cliente

async function Navbar() {
  const session = await getServerSession(authOptions);

  return (
    <nav className="flex justify-between items-center bg-gray-950 text-white px-4 md:px-24 py-2">
      <div className="hidden md:flex">
        <Link href="/dashboard">
          <Image
            src="/logo-white.png"
            alt="Logo"
            width={120}
            height={120}
            className="mr-3"
          />
        </Link>
      </div>

      {/* Menú normal en pantallas grandes */}
      <ul className="hidden md:flex gap-x-2 space-x-5">
        {!session?.user ? (
          <>
            <li>
              <Link href="/">Inicio</Link>
            </li>
            <li>
              <Link
                target="_blank"
                href="https://drive.google.com/file/d/1H1BqvwUrJaqk9l_zJBXoO3yeyixRrG6m/view?usp=sharing"
              >
                Menú
              </Link>
            </li>
            <li>
              <Link
                href="/auth/login"
                className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-500 transition-colors"
              >
                Login
              </Link>
            </li>

            {/* <li>
              <Link href="/auth/register">Register</Link>
            </li> */}
          </>
        ) : (
          <>
            {session?.user?.image !== 1 ? (
              <>
                <li>
                  <Link href="/dashboard/sales">Ventas</Link>
                </li>
                <li>
                  <Link href="/dashboard/ingredients">Ingredientes</Link>
                </li>
                <li>
                  <Link href="/dashboard/products">Productos</Link>
                </li>
                <li>
                  <Link href="/dashboard/IngredientInventory">Inventario</Link>
                </li>
                <li>
                  <Link
                    href="/api/auth/signout"
                    className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-500 transition-colors"
                  >
                    Logout
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link href="/dashboard/IngredientInventory">Inventario</Link>
                </li>
                <li>
                  <Link
                    href="/api/auth/signout"
                    className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-500 transition-colors"
                  >
                    Logout
                  </Link>
                </li>
              </>
            )}
          </>
        )}
      </ul>

      {/* Menú hamburguesa en dispositivos móviles */}
      <MenuToggle session={session} />
    </nav>
  );
}

export default Navbar;
