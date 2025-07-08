import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const publicRoutes = ['/auth/login', '/auth/unauthorized']

const restrictedRoutes = {
  bodeguero: [
    '/usuarios',
    '/usuarios/eliminados',
    '/adquisiciones/productos',
    '/adquisiciones/acopio',
    '/salida/revision',
    '/salida/carga_softland',
    '/entrada/carga_softland',
    '/entrada/revision',
    '/reporte/registro_acopio',
    '/reporte/trazabilidad',
  ],
  jefebodega: [
    '/usuarios',
    '/usuarios/eliminados',
    '/adquisiciones/productos',
    '/adquisiciones/acopio',
    '/reporte/registro_acopio',
    '/reporte/trazabilidad',
  ],
  adquisiciones: [
    '/usuarios',
    '/usuarios/eliminados',
    '/salida/',
    '/salida/acopio_productos',
    '/salida/revision',
    '/salida/carga_softland',
    '/entrada/orden_compra',
    '/entrada/carga_softland',
    '/entrada/revision',
  ],
}

function isRestricted(pathname: string, rol: string): boolean {
  const normalizedRol = rol.toLowerCase().replace(/\s+/g, '')
  const restricted = restrictedRoutes[normalizedRol as keyof typeof restrictedRoutes]
  if (!restricted) return false
  return restricted.some(route => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const rol = request.cookies.get('rol')?.value
  const { pathname } = request.nextUrl

  // 1. Rutas públicas
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // 2. No autenticado
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Restringir si el rol no puede acceder
  if (rol && isRestricted(pathname, rol)) {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url))
  }

  // 4. Acceso permitido
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
