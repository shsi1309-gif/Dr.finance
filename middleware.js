import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import aj from "@/lib/arcjet";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Run Arcjet Security
  const decision = await aj.protect(req, {
    userId: userId || "anonymous",
    // Match the "tokenBucket" rule you added in your screenshot
    requested: 1, 
  });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return new NextResponse("Too Many Requests", { status: 429 });
    }
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Run Clerk Auth
  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // This optimized matcher is CRITICAL for reducing bundle size
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    "/(api|trpc)(.*)",
  ],
};