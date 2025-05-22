import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Définissez les routes à protéger
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',       // Protège tout sous /dashboard
  '/profile(.*)',        // Protège tout sous /profile
  '/admin(.*)',          // Protège tout sous /admin
]);

export default clerkMiddleware((auth, req) => {
  // 2. Applique la protection uniquement aux routes définies
  if (isProtectedRoute(req)) {
    auth().protect();
  }

  // 3. Pour les routes publiques, aucune action n'est nécessaire
});

export const config = {
  // 4. Configuration des routes à analyser par le middleware
  matcher: [
    "/((?!.*\\..*|_next).*)",  // Exclut les fichiers statiques
    "/",                        // Inclut la page d'accueil
    "/(api|trpc)(.*)",          // Inclut les routes API
  ],
};