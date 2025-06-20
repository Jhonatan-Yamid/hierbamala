// src/middleware.js
import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt'; // Necesitas esta importación si usas NextAuth.js

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Rutas que son públicas y NO requieren autenticación
  // ASEGÚRATE de que estas rutas sean correctas para tu proyecto.
  // Es muy importante incluir la ruta raíz, login, registro y cualquier API pública.
  const publicPaths = ['/', '/auth/login', '/auth/register', '/api'];

  // Verifica si la ruta actual es una ruta pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Obtén el token del usuario (asumiendo que usas NextAuth.js para la autenticación)
  // Asegúrate de que process.env.NEXTAUTH_SECRET esté configurado en tus variables de entorno.
  // Este secreto debe ser el mismo que usas en [..nextauth]/route.js.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // CASO 1: Usuario autenticado intentando acceder a una página pública (raíz, login, registro)
  // Si el usuario ya está logueado y va a la página principal, login o registro, lo redirigimos al dashboard.
  if (isPublicPath && token) {
    if (pathname === '/auth/login' || pathname === '/auth/register' || pathname === '/') {
      console.log('Middleware: Usuario logueado intentando acceder a ruta pública, redirigiendo a /dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // CASO 2: Usuario NO autenticado intentando acceder a una página protegida
  // Si la ruta NO es pública Y el usuario NO tiene token (no está logueado), lo redirigimos al login.
  // Esto protegerá /dashboard, /cursos, etc.
  if (!isPublicPath && !token) {
    console.log('Middleware: Usuario no logueado intentando acceder a ruta protegida, redirigiendo a /auth/login');
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // CASO 3: Los demás casos (ej. usuario autenticado en una ruta protegida,
  // o usuario no autenticado en una ruta pública legítima)
  // En estos casos, permitimos que la solicitud continúe.
  return NextResponse.next();
}

// Define qué rutas debe "escuchar" el middleware
export const config = {
  matcher: [
    '/dashboard/:path*', // Aplica a todas las rutas dentro de /dashboard
    '/cursos/:path*',    // Aplica a todas las rutas dentro de /cursos
    '/auth/:path*',      // Aplica a todas las rutas dentro de /auth (login, register)
    '/',                 // Aplica a la ruta raíz
  ],
};