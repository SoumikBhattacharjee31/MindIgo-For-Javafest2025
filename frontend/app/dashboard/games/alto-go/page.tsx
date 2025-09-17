"use client";
import { Inter } from "next/font/google";
import styles from "./Home.module.css";
import dynamic from "next/dynamic";

const inter = Inter({ subsets: ["latin"] });

// Dynamically import the App component to avoid SSR issues
const AppWithoutSSR = dynamic(() => import("./components/App"), { 
  ssr: false,
  loading: () => (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #001122, #003366)',
      color: 'white',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif'
    }}>
      🏂 Loading Snowboarder Game...
    </div>
  )
});

export default function Home() {
  return (
    <main className={`${styles.main} ${inter.className}`} style={{ 
      margin: 0, 
      padding: 0, 
      width: '100vw', 
      height: '100vh',
      overflow: 'hidden'
    }}>
      <AppWithoutSSR />
    </main>
  );
}