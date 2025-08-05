"use client"
import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "./Home.module.css";
import dynamic from "next/dynamic";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

const AppWithoutSSR = dynamic(() => import("./components/App"), { ssr: false });

export default function Home() {
    // const [clicked, setClicked] = useState(false);
    // if (!clicked)
    //   return <button onClick={() => setClicked(true)}>Hello</button>;
    return (
        <>
            <Head>
                <title>Phaser Nextjs Template</title>
                <meta name="description" content="A Phaser 3 Next.js project template that demonstrates Next.js with React communication and uses Vite for bundling." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.png" />
            </Head>
            <main className={`${styles.main} ${inter.className}`}>
                <AppWithoutSSR />
            </main>
        </>
    );
}
