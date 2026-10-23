import type {Metadata} from "next";
import {Chilanka, Dekko, Inter, Roboto} from "next/font/google";
import "@/styles/App.module.css";
import "./globals.css";
import {Marquee} from "@/components/Marquee";
import {Footer} from "@/components/Footer";

const chilanka = Chilanka({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-chilanka",
});

const dekko = Dekko({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-dekko",
});

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-roboto",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "mustakuusi3D",
    openGraph: {
        title: "mustakuusi3D",
        url: "https://mustakuusi3d.vercel.app/",
        siteName: "mustakuusi3d",
        images: [
            {
                url: "https://mustakuusi3d.vercel.app/assets/hero.png",
                width: 1200,
                height: 630,
                alt: "mustakuusi3D",
            },
        ],
        type: "website",
    },
};

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html className={`${chilanka.variable} ${dekko.variable} ${roboto.variable} ${inter.variable}`}>
        <head>
            <script async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1172152988966182"
                    crossOrigin="anonymous"></script>
        </head>
        <body>
        <Marquee/>
        {children}
        <Footer/>
        </body>
        </html>
    );
}