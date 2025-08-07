import { SignIn } from "@clerk/nextjs";
import React from "react";

function page() {
    return (
        <main className="h-[100vh] flex items-center justify-center">
            <SignIn
                afterSignInUrl="/role-select"
                redirectUrl="/role-select"
                fallbackRedirectUrl="/"
            />
        </main>
    );
}

export default page;
