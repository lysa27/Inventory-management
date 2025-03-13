// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/login", "/register"];
  
  // Check if the current path is in the public paths
  const isPublicPath = publicPaths.some((path) => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // For API routes, we need to verify the JWT token
  if (request.nextUrl.pathname.startsWith("/api")) {
    const { isAuth, user } = await isAuthenticated(request);

    if (!isAuth) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // For protected routes that only inventory managers can access
    const inventoryManagerOnlyPaths = [
      "/api/items/create",
      "/api/items/update",
      "/api/items/delete",
      "/api/borrowings/create",
      "/api/damage/create",
    ];

    const requiresInventoryManager = inventoryManagerOnlyPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (requiresInventoryManager && user?.role !== "INVENTORY_MANAGER") {
      return NextResponse.json(
        { message: "Insufficient permissions" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // For page routes, we redirect to login if not authenticated
  const { isAuth } = await isAuthenticated(request);

  if (!isAuth) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure which paths should be protected by the middleware
export const config = {
  matcher: [
    // Match all routes except for static files, _next, and api/auth routes
    // "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
};