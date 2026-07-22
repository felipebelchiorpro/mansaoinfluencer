import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mansão dos Influencers - Votação Oficial",
  description: "Participe da votação oficial em tempo real da Mansão dos Influencers. Decida o futuro do reality show!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var flex = document.createElement('div');
                flex.style.display = 'flex';
                flex.style.gap = '1px';
                document.documentElement.appendChild(flex);
                var isSupported = getComputedStyle(flex).gap === '1px';
                flex.parentNode.removeChild(flex);
                if (!isSupported) {
                  document.documentElement.classList.add('no-flex-gap');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
