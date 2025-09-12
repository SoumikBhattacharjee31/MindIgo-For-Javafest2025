// components/App.tsx
import { useRef, useState, useEffect } from "react";
import { IRefPhaserGame, PhaserGame } from "./PhaserGame";
import { userService, User } from "../services/userService";
import AuthModal from "./AuthModal";
import * as Phaser from "phaser";

function App() {
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isGameReady, setIsGameReady] = useState(false);
  const phaserRef = useRef<IRefPhaserGame | null>(null);

  useEffect(() => {
    // Check if user exists on app load
    const existingUser = userService.getCurrentUser();
    if (existingUser) {
      setCurrentUser(existingUser);
      setIsGameReady(true);
    } else {
      // Show auth modal for new users
      setShowAuthModal(true);
    }
  }, []);

  const currentScene = (scene: Phaser.Scene) => {
    setCanMoveSprite(scene.scene.key !== "MainMenu");
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    setIsGameReady(true);
  };

  const handleAuthClose = () => {
    // If no user exists, create a guest user
    if (!currentUser) {
      const guestUser = userService.initializeUser();
      setCurrentUser(guestUser);
    }
    setShowAuthModal(false);
    setIsGameReady(true);
  };

  if (!isGameReady) {
    return (
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
        Loading Snowboarder Game...
        <AuthModal 
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div id="app" className="flex">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      <AuthModal 
        isOpen={showAuthModal}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;