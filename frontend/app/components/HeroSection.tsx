import { Heart, Sparkles, ChevronRight, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Journey to
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent block">
              Mental Wellness
            </span>
            Starts Here
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            A comprehensive platform that seamlessly combines physical, mental,
            and emotional health with AI-powered personalization and expert
            guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-2">
              Start Your Journey <ChevronRight className="h-5 w-5" />
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center gap-2">
              <Play className="h-5 w-5" /> Watch Demo
            </button>
          </div>
        </div>

        {/* Hero Image Placeholder */}
        {/* <div className="mt-16 relative">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl h-96 flex items-center justify-center shadow-2xl">
              <div className="text-white text-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-16 w-16" />
                </div>
                <p className="text-xl font-semibold">[Hero Image Placeholder]</p>
                <p className="text-lg opacity-90">Dashboard Preview</p>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 bg-yellow-400 rounded-full p-3 shadow-lg animate-bounce">
              <Sparkles className="h-6 w-6 text-yellow-800" />
            </div>
            <div className="absolute -top-4 -right-4 bg-green-400 rounded-full p-3 shadow-lg animate-pulse">
              <Heart className="h-6 w-6 text-green-800" />
            </div>
          </div> */}
      </div>
    </section>
  );
};

export default HeroSection;
