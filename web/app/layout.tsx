import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from '@/components/Providers';

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "CRANKD | The Digital Soul of Your Machine",
    description: "A high-fidelity system of record for vehicle ownership, maintenance, and heritage. Discover unique builds, track your garage, and connect with car culture.",
    keywords: ["cars", "automotive", "garage", "vehicle history", "car culture", "marketplace"],
    openGraph: {
        title: "CRANKD — The Digital Soul of Your Machine",
        description: "Discover unique builds, mint your garage, and join the world's most exclusive automotive community.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} antialiased bg-carbon text-text-main`}>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
