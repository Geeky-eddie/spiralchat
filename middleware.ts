import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/api/auth/webhook',
]);

export default clerkMiddleware(async (auth, request) => {
  // Skip protection for public routes
  if (isPublicRoute(request)) {
    return;
  }

  // Protect all other routes
  try {
    await auth.protect();
  } catch (error) {
    console.error("Authentication failed:", error);
    throw new Error("Unauthorized");
  }
});

export const config = {
  matcher: [
    // Exclude Next.js internals and static assets unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Include API and TRPC routes
    '/(api|trpc)(.*)',
  ],
};
