import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ColorStoreProvider } from "@/stores/providers/color-store-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PixelCollab | Blank Shared Canvas",
  description: "Collaborative pixel art canvas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body
        className={`${spaceGrotesk.variable} antialiased`}
      >
        <ColorStoreProvider>
          {children}
        </ColorStoreProvider>
      </body>
    </html>
  );
}
