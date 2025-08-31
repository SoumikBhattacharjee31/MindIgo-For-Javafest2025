"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

const Game = dynamic(() => import("./Game"), { ssr: false });

interface PopularBeatmap {
  id: string;
  title: string;
  artist: string;
  creator: string;
  difficulty: string;
  stars: number;
  bpm: number;
  length: string;
}

const popularBeatmaps: PopularBeatmap[] = [
  {
    id: "131891",
    title: "Blue Zenith",
    artist: "xi",
    creator: "Asphyxia",
    difficulty: "FOUR DIMENSIONS",
    stars: 6.57,
    bpm: 200,
    length: "4:04"
  },
  {
    id: "41823", 
    title: "Senbonzakura",
    artist: "Hatsune Miku",
    creator: "val0108",
    difficulty: "Insane",
    stars: 4.22,
    bpm: 154,
    length: "4:04"
  },
  {
    id: "774965",
    title: "Through the Fire and Flames",
    artist: "DragonForce", 
    creator: "Ponoyoshi",
    difficulty: "Legend",
    stars: 7.61,
    bpm: 200,
    length: "7:21"
  },
  {
    id: "292301",
    title: "Exit This Earth's Atomosphere",
    artist: "Camellia",
    creator: "Shiirn", 
    difficulty: "Caelestis",
    stars: 6.83,
    bpm: 170,
    length: "5:28"
  },
  {
    id: "39804",
    title: "Pinball",
    artist: "Nightcore",
    creator: "jericho2442",
    difficulty: "Insane",
    stars: 4.42,
    bpm: 160,
    length: "3:06"
  }
];

export default function EnhancedPage() {
  const [showMenu, setShowMenu] = useState(true);
  const [selectedBeatmap, setSelectedBeatmap] = useState<string | null>(null);
  const [customBeatmapId, setCustomBeatmapId] = useState("");

  const handleBeatmapSelect = (beatmapId: string) => {
    setSelectedBeatmap(beatmapId);
    setShowMenu(false);
  };

  const handleBackToMenu = () => {
    setSelectedBeatmap(null);
    setShowMenu(true);
  };

  const handleCustomBeatmap = () => {
    if (customBeatmapId.trim()) {
      handleBeatmapSelect(customBeatmapId.trim());
    }
  };

  const getDifficultyColor = (stars: number) => {
    if (stars >= 6.5) return "text-purple-600 bg-purple-100";
    if (stars >= 5.3) return "text-red-600 bg-red-100";
    if (stars >= 4.0) return "text-orange-600 bg-orange-100";
    if (stars >= 2.7) return "text-yellow-600 bg-yellow-100";
    if (stars >= 2.0) return "text-green-600 bg-green-100";
    return "text-blue-600 bg-blue-100";
  };

  if (!showMenu && selectedBeatmap) {
    return <Game beatmapId={selectedBeatmap} onBackToMenu={handleBackToMenu} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#eff6ff] via-[#eef2ff] to-[#fdf2f8] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-light mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Calm Rhythm
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            Real osu! beatmaps in a soothing 4-key rhythm game
          </p>
          <p className="text-sm text-slate-500">
            Press <strong>A / S / D / F</strong> to hit the notes as they reach the bottom
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/50 mb-6"
        >
          <h2 className="text-2xl font-semibold text-slate-700 mb-4 text-center">Select a Beatmap</h2>
          
          <div className="grid gap-4 mb-6">
            {popularBeatmaps.map((beatmap, index) => (
              <motion.button
                key={beatmap.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                onClick={() => handleBeatmapSelect(beatmap.id)}
                className="group bg-white/60 hover:bg-white/80 rounded-2xl p-4 transition-all duration-300 border border-white/30 hover:border-white/50 hover:shadow-lg transform hover:scale-105"
              >
                <div className="flex justify-between items-center">
                  <div className="text-left flex-1">
                    <div className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">
                      {beatmap.artist} - {beatmap.title}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">
                      [{beatmap.difficulty}] by {beatmap.creator}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{beatmap.bpm} BPM</span>
                      <span>{beatmap.length}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getDifficultyColor(beatmap.stars)}`}>
                      {beatmap.stars}☆
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-medium text-slate-700 mb-3 text-center">Or enter a custom beatmap ID</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={customBeatmapId}
                onChange={(e) => setCustomBeatmapId(e.target.value)}
                placeholder="Enter osu! beatmap ID (e.g., 131891)"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all duration-200 bg-white/70"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomBeatmap()}
              />
              <button
                onClick={handleCustomBeatmap}
                disabled={!customBeatmapId.trim()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                Play
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Find beatmap IDs on <a href="https://osu.ppy.sh" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">osu.ppy.sh</a>
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/60 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/30"
        >
          <h3 className="text-lg font-semibold text-slate-700 mb-3 text-center">How to Play</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <div className="font-medium text-slate-700 mb-2">Controls:</div>
              <div className="space-y-1">
                <div><strong>A S D F</strong> - Hit notes in respective lanes</div>
                <div><strong>P</strong> - Pause/Resume</div>
                <div><strong>Click</strong> - Start game</div>
              </div>
            </div>
            <div>
              <div className="font-medium text-slate-700 mb-2">Scoring:</div>
              <div className="space-y-1">
                <div><span className="text-emerald-600 font-bold">Perfect</span> - 1000 points</div>
                <div><span className="text-blue-600 font-bold">Great</span> - 650 points</div>
                <div><span className="text-amber-600 font-bold">Good</span> - 300 points</div>
                <div><span className="text-red-600 font-bold">Miss</span> - Breaks combo</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xs text-slate-400 mt-8 text-center"
      >
        <div>Powered by osu! API • Beatmaps courtesy of the osu! community</div>
        <div className="mt-1">This is a fan-made rhythm game inspired by osu!</div>
      </motion.footer>
    </div>
  );
}