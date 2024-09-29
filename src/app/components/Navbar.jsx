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
        <Image src="/logo-white.png" alt="Logo" width={120} height={120} className="mr-3" />
      </Link>
      </div>
    
      {/* Menú normal en pantallas grandes */}
      <ul className="hidden md:flex gap-x-2">
        {!session?.user ? (
          <>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/auth/login">Login</Link>
            </li>
            <li>
              <Link href="/auth/register">Register</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/dashboard/ingredients">Ingredientes</Link>
            </li>
            <li>
              <Link href="/dashboard/products">Productos</Link>
            </li>
            <li>
              <Link href="/api/auth/signout">Logout</Link>
            </li>
          </>
        )}
      </ul>

      {/* Menú hamburguesa en dispositivos móviles */}
      <MenuToggle session={session} />
    </nav>
  );
}

export default Navbar;
