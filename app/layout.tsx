import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Nunito } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
    title: "Daily Task Planner | Online Progress App",
    description:
        "Comprehensive platform for quiz management, task planning, and progress tracking. Designed for students, teachers, and administrators.",
};

const nunito = Nunito({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-nunito",
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link
                    rel="stylesheet"
                    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
                    integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                />
            </head>
            <body
                className={`${nunito.className}  antialiased`}
                suppressHydrationWarning={true}
            >
                <AuthProvider>
                    <Toaster position="top-center" />
                    <Header />
                    <main className="min-h-screen">{children}</main>
                </AuthProvider>
            </body>
        </html>
    );
}
