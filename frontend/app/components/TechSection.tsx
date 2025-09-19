import { Star, Shield, Zap } from "lucide-react";

const TechSection = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Built with Cutting-Edge Technology
          </h2>
          <p className="text-xl text-gray-600">
            Secure, scalable, and reliable platform you can trust
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 rounded-full p-6 w-fit mx-auto mb-6">
              <Shield className="h-12 w-12 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Your data is protected with enterprise-grade security and privacy
              measures
            </p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 rounded-full p-6 w-fit mx-auto mb-6">
              <Zap className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered</h3>
            <p className="text-gray-600">
              Advanced AI models provide personalized recommendations and
              insights
            </p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 rounded-full p-6 w-fit mx-auto mb-6">
              <Star className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Expert-Backed
            </h3>
            <p className="text-gray-600">
              All content and features are reviewed and approved by mental
              health professionals
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechSection;
