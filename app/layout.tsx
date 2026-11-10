import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { BASICSYSTEMDATA } from "@/lib/constants/helper-constants";

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-lato",
});

export const metadata: Metadata = {
  title: BASICSYSTEMDATA.appName,
  description: BASICSYSTEMDATA.appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.variable} font-sans tabular-nums antialiased`}>
        {children}
      </body>
    </html>
  );
}