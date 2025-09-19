import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Infinity Loop - Puzzle Game",
  description: "Connect the loops in this mind-bending puzzle game",
};

export default function InfinityLoopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}