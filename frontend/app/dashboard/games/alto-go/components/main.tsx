import { Boot } from "./scenes/Boot";
import { AUTO, Game } from "phaser";
import { Preloader } from "./scenes/Preloader";
import { TestScene } from "./scenes/TestScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { HighScoresScene } from "./scenes/HighScoreScene";
import { MainMenuScene } from "./scenes/MainMenuScene";

//  Simplified and stable Game Config
const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width:
    typeof window !== "undefined" ? Math.min(window.innerWidth, 1920) : 1024,
  height:
    typeof window !== "undefined" ? Math.min(window.innerHeight, 1080) : 768,
  parent: "game-container",
  backgroundColor: "#001122",

  // Basic rendering settings for stability
  antialias: true,
  roundPixels: false,

  // Performance settings
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },

  // Scene configuration
  scene: [
    Boot,
    Preloader,
    MainMenuScene,
    TestScene,
    GameOverScene,
    HighScoresScene,
  ],

  // Physics settings
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { x: 0, y: 300 },
      fps: 60,
    },
  },

  // Audio configuration
  audio: {
    disableWebAudio: false,
    noAudio: false,
  },

  // Input configuration
  input: {
    keyboard: true,
    mouse: true,
    touch: true,
    gamepad: false, // Disable gamepad to avoid issues
  },

  // Scale configuration for responsive design
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1024,
    height: 768,
    min: {
      width: 320,
      height: 240,
    },
    max: {
      width: 1920,
      height: 1080,
    },
  },

  // DOM configuration
  dom: {
    createContainer: true,
  },

  // Banner configuration
  banner: {
    hidePhaser: true,
  },
};

// Simplified game initialization with better error handling
const StartGame = (parent: string) => {
  try {
    const game = new Game({ ...config, parent });

    // Add basic game utilities
    (window as any).gameUtils = {
      getFPS: () => game.loop.actualFps,
      getMemoryUsage: () => {
        if (typeof performance !== "undefined" && "memory" in performance) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return "N/A";
      },

      toggleFullscreen: () => {
        if (game.scale.isFullscreen) {
          game.scale.stopFullscreen();
        } else {
          game.scale.startFullscreen();
        }
      },
    };

    // Add resize handler
    const handleResize = () => {
      if (game && game.scale) {
        game.scale.refresh();
      }
    };

    window.addEventListener("resize", handleResize);

    // Add visibility change handler
    const handleVisibilityChange = () => {
      if (!game || !game.scene) return;

      if (document.hidden) {
        // When the tab becomes hidden, get all currently active scenes.
        const activeScenes = game.scene.getScenes(true);

        // Loop through the active scenes and pause each one.
        activeScenes.forEach((scene) => {
          // We can check if the scene has a physics world before trying to pause it
          if (scene.physics?.world) {
            scene.physics.world.pause();
          }
          game.scene.pause(scene.scene.key);
          console.log(`Paused scene: ${scene.scene.key}`);
        });
      } else {
        // When the tab becomes visible again, get all scenes that are paused.
        const pausedScenes = game.scene
          .getScenes(false)
          .filter((scene) => scene.sys.isPaused());

        // Loop through the paused scenes and resume each one.
        pausedScenes.forEach((scene) => {
          game.scene.resume(scene.scene.key);
          // Also resume the physics world if it exists
          if (scene.physics?.world) {
            scene.physics.world.resume();
          }
          console.log(`Resumed scene: ${scene.scene.key}`);
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Clean up event listeners when game is destroyed
    game.events.once("destroy", () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });

    // Performance monitoring (development only)
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      const perfInterval = setInterval(() => {
        if (game && game.loop && (window as any).gameUtils) {
          console.log(
            `FPS: ${Math.round((window as any).gameUtils.getFPS())}, Memory: ${(
              window as any
            ).gameUtils.getMemoryUsage()}`
          );
        }
      }, 5000);

      // Clean up interval when game is destroyed
      game.events.once("destroy", () => {
        clearInterval(perfInterval);
      });
    }

    return game;
  } catch (error) {
    console.error("Failed to start game:", error);

    // Fallback to Canvas renderer
    const fallbackConfig = {
      ...config,
      type: Phaser.CANVAS,
      antialias: false,
      render: {
        transparent: false,
        clearBeforeRender: true,
      },
    };

    try {
      console.log("Attempting fallback to Canvas renderer...");
      return new Game({ ...fallbackConfig, parent });
    } catch (fallbackError) {
      console.error(
        "Failed to start game with Canvas fallback:",
        fallbackError
      );

      // Display error message to user
      const errorElement = document.getElementById(parent);
      if (errorElement) {
        errorElement.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #001122, #003366);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
          ">
            <h1 style="color: #ff4444; margin-bottom: 20px; font-size: 2em;">⚠️ Game Failed to Load</h1>
            <p style="margin-bottom: 10px; font-size: 1.2em;">Unable to initialize the game engine.</p>
            <p style="margin-bottom: 20px; opacity: 0.8;">Please try refreshing the page or updating your browser.</p>
            <button onclick="location.reload()" style="
              background: #4CAF50;
              color: white;
              border: none;
              padding: 15px 30px;
              border-radius: 8px;
              cursor: pointer;
              font-size: 18px;
              font-weight: bold;
              transition: background 0.3s;
            " onmouseover="this.style.background='#45a049'" onmouseout="this.style.background='#4CAF50'">
              🔄 Retry Game
            </button>
          </div>
        `;
      }

      return null;
    }
  }
};

export default StartGame;
