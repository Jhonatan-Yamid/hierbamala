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
  const [businessType, setBusinessType] = useState("restaurant");
  const [permissionStatus, setPermissionStatus] = useState(
    typeof window !== "undefined" ? Notification.permission : "default"
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

  // Traer datos del negocio al cargar
  useEffect(() => {
    const fetchBusinessConfig = async () => {
      try {
        const res = await fetch("/api/business");
        if (res.ok) {
          const data = await res.json();
          if (data && data.type) {
            setBusinessType(data.type.toLowerCase());
          }
        }
      } catch (err) {
        console.error("Error cargando configuración de negocio:", err);
      }
    };
    fetchBusinessConfig();
  }, []);

  const handleSubscribe = async () => {
    try {
      await registerServiceWorker();
      await subscribeUser(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
      setIsSubscribed(true);
    } catch (error) {
      console.error("Error al suscribirse:", error);
    }
  };

  const handleRequestPermission = () => {
    if (Notification.permission === "denied") {
      alert(
        "Para recibir notificaciones, por favor, habilita los permisos de notificación en la configuración de tu navegador."
      );
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        handleSubscribe();
      } else {
        alert("Las notificaciones están deshabilitadas.");
      }
    });
  };

  // Definición base de opciones
  const allOptions = [
    {
      label: "Ventas",
      href: "/dashboard/saleTable",
      icon: <FaCashRegister size={48} />,
      roles: [1, null], // 1: Admin, 2: Empleado (ajustar según tu lógica)
    },
    {
      label: "Ingredientes",
      href: "/dashboard/ingredients",
      icon: <FaCarrot size={48} />,
      roles: [1],
      hideIfFruver: true, // Marca para ocultar en Fruver
    },
    {
      label: "Productos",
      href: "/dashboard/products",
      icon: <FaBox size={48} />,
      roles: [1],
    },
    {
      label: "Inventario",
      href: businessType === "fruver" ? "/dashboard/ProductInventory" : "/dashboard/IngredientInventory",
      icon: <FaWarehouse size={48} />,
      roles: [1, null],
    },
    {
      label: "Apertura",
      href: "/dashboard/openChecklist",
      icon: <FaClipboardCheck size={48} />,
      roles: [1, null],
    },
    {
      label: "Proveedores",
      href: "/dashboard/providers",
      icon: <FaTruck size={48} />,
      roles: [1],
    },
    {
      label: "Alertas",
      href: "/dashboard/alerts",
      icon: <FaBell size={48} />,
      roles: [1],
    },
    {
      label: "Cerrar Sesión",
      href: "/api/auth/signout",
      icon: <FaSignOutAlt size={48} />,
      roles: [1, null],
      isAction: true,
    },
  ];

  // Filtrado dinámico de opciones
  const menuOptions = allOptions.filter((option) => {
    const userRole = session?.user?.image ?? null; // Tu lógica actual usa .image como rol
    const hasRole = option.roles.includes(userRole);
    
    // Si es fruver y la opción debe ocultarse, la quitamos
    if (businessType === "fruver" && option.hideIfFruver) {
      return false;
    }
    
    return hasRole;
  });

  return (
    <section className="h-[calc(100vh-7rem)] flex flex-col items-center bg-gray-950 text-slate-200 ">
      {!isSubscribed && (
        <div>
          <button
            onClick={handleRequestPermission}
            className="mt-2 bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-600 transition-colors"
          >
            Activar Notificaciones
          </button>
        </div>
      )}
      <h1 className="text-3xl font-bold mt-6 mb-8 text-center px-4">
        ¿Qué quieres hoy, {session?.user?.name}?
      </h1>
      <div className="grid grid-cols-2 gap-6 px-6 md:grid-cols-3 lg:grid-cols-4 pb-10">
        {menuOptions.map((option, index) => (
          <Link
            key={index}
            href={option.href}
            onClick={option.isAction ? (e) => { e.preventDefault(); signOut(); } : undefined}
            className="flex flex-col items-center justify-center p-6 bg-gray-900 border border-gray-800 hover:bg-gray-800 rounded-xl shadow-xl transition-all transform hover:scale-105"
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