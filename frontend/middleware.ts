import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
];

// Define authentication routes that should be redirected if already logged in
const authRoutes = [
  '/login',
  '/register',
];

export function middleware(request: NextRequest) {
  // Get the path of the current request
  const path = request.nextUrl.pathname;
  
  // Check if user is authenticated by looking for the token cookie
  const isAuthenticated = request.cookies.has('token');
  
  // Case 1: User is authenticated but trying to access auth routes (login/register)
  if (isAuthenticated && authRoutes.includes(path)) {
    // Redirect authenticated users away from login/register pages to home
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Case 2: User is not authenticated and trying to access any route other than public routes
  if (!isAuthenticated && !publicRoutes.includes(path)) {
    // Redirect unauthenticated users to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Allow the request to proceed normally for all other cases
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
