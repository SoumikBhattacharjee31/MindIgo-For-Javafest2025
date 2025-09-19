import {
  Heart,
  Calendar,
  Gamepad2,
  Phone,
  Star,
  Shield,
  Zap,
} from "lucide-react";

const AdditionalFeaturesSection = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            More Ways to Support Your Wellness
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Mood Tracking
            </h3>
            <p className="text-gray-600 text-sm">
              Monitor your emotional states and identify patterns over time
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all">
            <Calendar className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Regular Sessions
            </h3>
            <p className="text-gray-600 text-sm">
              Join live webinars and workshops led by experts
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all">
            <Gamepad2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Wellness Games
            </h3>
            <p className="text-gray-600 text-sm">
              Interactive games for cognitive stimulation and relaxation
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all">
            <Phone className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Crisis Support
            </h3>
            <p className="text-gray-600 text-sm">
              Quick access to emergency hotline information when needed
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdditionalFeaturesSection;
