import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/roles";

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

// define public routes
const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/categories(.*)",
    "/categories(.*)",
    "/stats(.*)",
    "/leaderboard(.*)",
    "/quiz(.*)",
    "/results(.*)",
    "/tasks(.*)",
]);

// define admin routes
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

// define teacher routes
const isTeacherRoute = createRouteMatcher(["/teacher(.*)", "/api/teacher(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    // skip authentication for public routes
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // authenticate user and protect non-public routes
    await auth.protect();

    // check role-based access for protected routes
    try {
        if (isAdminRoute(req)) {
            const user = await getCurrentUser();
            if (!user || user.role !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        } else if (isTeacherRoute(req)) {
            const user = await getCurrentUser();
            if (!user || (user.role !== "teacher" && user.role !== "admin")) {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }
    } catch (error) {
        console.log("Error checking user role in middleware:", error);
        // Continue to allow access if role check fails (fallback to component-level protection)
    }

    return NextResponse.next();
});
