import React from "react";
import Link from "next/link";

function Page() {
    return (
        <main className="h-[100vh] flex items-center justify-center">
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-semibold">Sign-up moved</h1>
                <p>Please use the local authentication pages.</p>
                <div className="space-x-4">
                    <Link className="underline" href="/register">
                        Go to Register
                    </Link>
                    <Link className="underline" href="/login">
                        Go to Login
                    </Link>
                </div>
            </div>
        </main>
    );
}

export default Page;
