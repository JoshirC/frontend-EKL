import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Lista de rutas públicas que no requieren autenticación
const publicRoutes = ['/auth/login']

// Rutas que el Bodeguero NO puede acceder
const restrictedRoutes = {
  bodeguero: [
    '/usuarios',
    '/usuarios/eliminados',
    '/adquisiciones',
    '/adquisiciones/acopio',
    '/salida/revision',
    '/salida/carga_softland',
    '/reporte/registro_acopio',
  ],
  jefeBodega: [
    '/usuarios',
    '/usuarios/eliminados',
    '/adquisiciones',
    '/adquisiciones/acopio',
  ],
  adquisiciones: [
    '/usuarios',
    '/usuarios/eliminados',
  ],
}


export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  // 1. Permitir acceso a rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // 2. Redirigir al login si no hay token
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname) // Opcional: guardar URL original
    return NextResponse.redirect(loginUrl)
  }

  // 3. Obtener el rol del usuario
  const rol = request.cookies.get('rol')?.value


  // 4. Si no hay rol definido, permitir acceso (o redirigir según tu necesidad)
  if (!rol) {
    return NextResponse.next()
  }

  // 5. Verificar rutas restringidas SOLO para Bodeguero
  const isRestrictedForBodeguero = restrictedRoutes.bodeguero.some(route => 
    pathname.startsWith(route) // Usamos startsWith para manejar subrutas
  )

  const isRestrictedForJefeBodega = restrictedRoutes.jefeBodega.some(route => 
    pathname.startsWith(route) // Usamos startsWith para manejar subrutas
  ) 

  const isRestrictedForAdquisiciones = restrictedRoutes.adquisiciones.some(route => 
    pathname.startsWith(route) // Usamos startsWith para manejar subrutas
  ) 
  

  if (isRestrictedForBodeguero && rol === 'Bodeguero') {
    // Redirigir a una página de "no autorizado" en lugar del home
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url))
    }

  if (isRestrictedForJefeBodega && rol === 'Jefe Bodega') {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url))
  }

  if (isRestrictedForAdquisiciones && rol === 'Adquisiciones') {
    return NextResponse.redirect(new URL('/auth/unauthorized', request.url))
  }

  // 6. Permitir acceso en todos los demás casos
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public|unauthorized).*)',
  ],
}