// middleware.js
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/booking(.*)',
  '/register/profile(.*)',
]);

const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/courses(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/teachers(.*)',
  '/pricing(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};