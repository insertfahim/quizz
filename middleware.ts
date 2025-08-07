import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

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

export default clerkMiddleware(async (auth, req) => {
    // skip authentication for public routes
    if (isPublicRoute(req)) {
        return NextResponse.next();
    }

    // authenticate user and protect non-public routes
    await auth.protect();

    return NextResponse.next();
});
