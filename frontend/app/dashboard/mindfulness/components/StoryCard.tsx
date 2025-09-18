

const StoryCard = () => (
  <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-xl shadow-lg border border-green-200">
    <h2 className="text-2xl font-bold text-emerald-800 mb-4">Meditation</h2>
    <p className="text-emerald-600 mb-6">Find your inner peace with guided meditation.</p>
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-emerald-700">5-Minute Breathing</h3>
        <p className="text-sm text-emerald-600">Perfect for beginners</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-semibold text-emerald-700">Body Scan</h3>
        <p className="text-sm text-emerald-600">Release tension and stress</p>
      </div>
    </div>
  </div>
);
export default StoryCard;
