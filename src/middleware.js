import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // ... (definición de publicPaths y isPublicPath)

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }); // <-- Obtiene la sesión del usuario

  // ... (CASO 1: redirección de usuario logueado desde rutas públicas)

  // CASO 2: Usuario NO autenticado intentando acceder a una página protegida
  // Si la ruta NO es pública (es decir, es una ruta protegida como /dashboard)
  // Y el usuario NO tiene token (no está logueado)
  if (!isPublicPath && !token) {
    console.log('Middleware: Usuario no logueado intentando acceder a ruta protegida, redirigiendo a /auth/login');
    return NextResponse.redirect(new URL('/auth/login', req.url)); // <-- LO ENVÍA AL LOGIN
  }

  // ... (CASO 3: Los demás casos)
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*', // <-- Asegura que el middleware monitoree el dashboard
    '/auth/:path*',
    '/',
  ],
};