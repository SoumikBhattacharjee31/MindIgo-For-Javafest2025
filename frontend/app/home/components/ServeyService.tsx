import React from 'react';
import { motion } from "framer-motion";

const SurveyService = () => {
    const fadeInAnimationVariants = {
        initial: {
          opacity: 0,
          x: 10,
        },
        animate: (index: number) => ({
          opacity: 1,
          x: 0,
          transition: {
            delay: 0.2 * index,
            duration: 1,
          },
        }),
      };
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100 p-8">
      <motion.div className="md:w-1/2 w-full flex flex-col justify-center items-start p-6"
        variants={fadeInAnimationVariants}
        initial="initial"
        whileInView="animate"
        // viewport={{ once: true }}
        custom={1}>
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Quizzes and Surveys</h1>
        <p className="text-lg text-gray-700 mb-6">
          Determine how you are feeling and receive assistance based on your current situation.
        </p>
        <button className="btn btn-primary">Get Started</button>
      </motion.div>
      <div className="md:w-1/2 w-full flex justify-center items-center">
        <img src="/pexels-cottonbro-4101143.jpg" className="w-full h-auto rounded-lg shadow-lg" alt="Big Brain" />
      </div>
    </div>
  );
};

export default SurveyService;
