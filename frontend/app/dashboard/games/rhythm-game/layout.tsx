import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calm Rhythm - Rhythm Game",
  description: "A soothing 2.5D rhythm game for relaxation and focus",
};

export default function RhythmGameLayout({
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