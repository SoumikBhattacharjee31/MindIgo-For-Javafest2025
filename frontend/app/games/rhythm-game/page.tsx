"use client"
import dynamic from "next/dynamic";


const Game = dynamic(() => import("./Game"), { ssr: false });


export default function Page() {
return (
<div className="min-h-screen w-full bg-gradient-to-b from-[#eff6ff] via-[#eef2ff] to-[#fdf2f8] flex flex-col items-center justify-center p-4">
<div className="max-w-5xl w-full">
<h1 className="text-4xl md:text-5xl font-light text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-sky-500">
Calm Rhythm
</h1>
<p className="text-center text-slate-600 mb-6">
A soothing 2.5D rhythm game. Press <strong>A / S / D / F</strong> on the beat.
</p>
</div>
<Game />
<footer className="text-xs text-slate-400 mt-6">
Tip: Headphones recommended 🎧
</footer>
</div>
);
}