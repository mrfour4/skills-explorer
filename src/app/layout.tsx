import QueryProvider from "@/providers/query-provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Job Skills Explorer | Find In-Demand Skills for Your Career",
    description:
        "Discover the most in-demand skills for different job positions. Search by job title, experience level, and location to find the skills you need for your career.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <QueryProvider>
                    <NuqsAdapter>{children}</NuqsAdapter>
                </QueryProvider>
            </body>
        </html>
    );
}
