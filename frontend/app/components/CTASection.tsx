const CTASection = () => {
  return (
    <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-6">
          Ready to Transform Your Mental Wellness Journey?
        </h2>
        <p className="text-xl text-indigo-100 mb-8">
          Join thousands of users who are already improving their mental health
          with Mindigo
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-white text-indigo-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg">
            Start Free Trial
          </button>
          <button className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-indigo-600 transition-all">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
