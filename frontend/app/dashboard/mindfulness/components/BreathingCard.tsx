
const BreathingCard = () => (
  <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-8 rounded-xl shadow-lg border border-purple-200">
    <h2 className="text-2xl font-bold text-violet-800 mb-4">Breathing Exercise</h2>
    <p className="text-violet-600 mb-6">Control your breath, control your mind.</p>
    <div className="flex flex-col items-center space-y-4">
      <div className="w-24 h-24 bg-violet-200 rounded-full flex items-center justify-center">
        <div className="w-16 h-16 bg-violet-400 rounded-full animate-pulse"></div>
      </div>
      <button className="bg-violet-600 text-white px-6 py-2 rounded-full hover:bg-violet-700 transition-colors">
        Start Breathing
      </button>
    </div>
  </div>
);

export default BreathingCard;
