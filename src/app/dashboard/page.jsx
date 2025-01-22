"use client";
import { registerServiceWorker, subscribeUser } from "@/libs/notifications";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCashRegister,
  FaCarrot,
  FaBox,
  FaWarehouse,
  FaClipboardCheck,
  FaTruck,
  FaSignOutAlt,
  FaHome,
  FaSignInAlt,
  FaUserPlus,
  FaBell,
} from "react-icons/fa";

const DashboardPage = () => {
  const { data: session } = useSession();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(
    Notification.permission
  );
  useEffect(() => {
    const setupNotifications = async () => {
      if (Notification.permission === "granted") {
        setIsSubscribed(true);
      } else if (Notification.permission === "denied") {
        setIsSubscribed(false);
      }
    };
    setupNotifications();
  }, []);
  const handleSubscribe = async () => {
    try {
      // Intentar registrar el Service Worker y suscribirse
      await registerServiceWorker();
      await subscribeUser(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
      setIsSubscribed(true); // Actualizar estado de suscripción
    } catch (error) {
      console.error("Error al suscribirse:", error);
    }
  };

  const handleRequestPermission = () => {
    // Verificar el estado del permiso
    if (Notification.permission === "denied") {
      alert(
        "Para recibir notificaciones, por favor, habilita los permisos de notificación en la configuración de tu navegador."
      );
      return;
    }

    // Si el permiso es "default", pedimos el permiso
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        handleSubscribe();
      } else {
        alert("Las notificaciones están deshabilitadas.");
      }
    });
  };

  const menuOptions =
    session?.user?.image === 1
      ? [
          {
            label: "Ventas",
            href: "/dashboard/saleTable",
            icon: <FaCashRegister size={48} />,
          },
          {
            label: "Ingredientes",
            href: "/dashboard/ingredients",
            icon: <FaCarrot size={48} />,
          },
          {
            label: "Productos",
            href: "/dashboard/products",
            icon: <FaBox size={48} />,
          },
          {
            label: "Inventario",
            href: "/dashboard/IngredientInventory",
            icon: <FaWarehouse size={48} />,
          },
          {
            label: "Apertura",
            href: "/dashboard/openChecklist",
            icon: <FaClipboardCheck size={48} />,
          },
          {
            label: "Proveedores",
            href: "/dashboard/providers",
            icon: <FaTruck size={48} />,
          },
          {
            label: "Alertas",
            href: "/dashboard/alerts",
            icon: <FaBell size={48} />,
          },
          {
            label: "Cerrar Sesión",
            href: "/api/auth/signout",
            icon: <FaSignOutAlt size={48} />,
          },
        ]
      : [
          {
            label: "Inventario",
            href: "/dashboard/IngredientInventory",
            icon: <FaWarehouse size={48} />,
          },
          {
            label: "Apertura",
            href: "/dashboard/openChecklist",
            icon: <FaClipboardCheck size={48} />,
          },
          {
            label: "Cerrar Sesión",
            href: "/api/auth/signout",
            icon: <FaSignOutAlt size={48} />,
          },
        ];

  const guestOptions = [
    { label: "Home", href: "/", icon: <FaHome size={48} /> },
    { label: "Login", href: "/auth/login", icon: <FaSignInAlt size={48} /> },
    {
      label: "Register",
      href: "/auth/register",
      icon: <FaUserPlus size={48} />,
    },
  ];

  return (

      
      <section className="h-[calc(100vh-7rem)] flex flex-col items-center bg-gray-950 text-slate-200 ">
        {/* Mostrar opción para pedir permisos si no está suscrito */}
      {!isSubscribed && (
        <div>
          <button
            onClick={handleRequestPermission}
            className="mt-2 bg-emerald-700 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Activar Notificaciones
          </button>
        </div>
      )}
        <h1 className="text-3xl font-bold mt-6 mb-8">
          ¿Qué quieres hacer hoy {session?.user?.name}?
        </h1>
        <div className="grid grid-cols-2 gap-6 px-6 md:grid-cols-3 lg:grid-cols-3 pb-6">
          {menuOptions.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className="flex flex-col items-center justify-center p-6 bg-gray-800 hover:bg-gray-700 rounded-lg shadow-lg transition-all transform hover:scale-105"
            >
              <div className="text-white mb-4">{option.icon}</div>
              <span className="text-lg font-semibold text-white">
                {option.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
  );
};

export default DashboardPage;
