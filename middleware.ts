import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/utils/auth";

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};

// Define route matchers
function createRouteMatcher(patterns: string[]) {
    return (request: NextRequest) => {
        const { pathname } = request.nextUrl;
        return patterns.some((pattern) => {
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(pathname);
        });
    };
}

// define public routes
const isPublicRoute = createRouteMatcher([
    "/",
    "/login",
    "/register",
    "/api/auth/(.*)",
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

export default async function middleware(req: NextRequest) {
    // skip authentication for public routes
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // check authentication for protected routes
    try {
        const user = await getCurrentUser(req);

        // If not authenticated, redirect to login
        if (!user) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        // Check role-based access for protected routes
        if (isAdminRoute(req)) {
            if (user.role !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        } else if (isTeacherRoute(req)) {
            if (user.role !== "teacher" && user.role !== "admin") {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        return NextResponse.next();
    } catch (error) {
        console.log("Error in middleware:", error);
        // If there's an error, redirect to login
        return NextResponse.redirect(new URL("/login", req.url));
    }
}
