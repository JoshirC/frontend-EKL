import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de rutas públicas que no requieren autenticación
const publicRoutes = ['/auth/login']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // Si la ruta es pública, permitir el acceso
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuración de las rutas que deben ser protegidas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 