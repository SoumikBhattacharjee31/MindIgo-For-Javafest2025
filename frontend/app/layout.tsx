"use client"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"] });
import { Provider } from 'react-redux';
import { store } from './store/store';
// export const metadata: Metadata = {
//   title: "Mindigo",
//   description: "Your Mental Health Companion",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* {children} */}
          <Provider store={store}>{children}</Provider>
      </body>
    </html>
  );
}
