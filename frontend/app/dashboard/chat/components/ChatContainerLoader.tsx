import { Loader2, Sparkles } from "lucide-react";

const ChatContainerLoader = () => {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="relative mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-indigo-600" />
            <Sparkles className="w-6 h-6 text-rose-500 absolute -top-2 -right-2 animate-pulse" />
          </div>
          <p className="text-gray-800 text-lg font-medium mb-2">Starting your wellness session</p>
          <p className="text-gray-600 text-sm">Creating a safe space for you</p>
        </div>
      </div>
    );
}

export default ChatContainerLoader;