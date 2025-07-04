// src/components/NewTestPrompt.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const NewTestPrompt = ({ onNewTest }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative mb-6 bg-gradient-to-r from-blue-500 to-indigo-600 p-8 md:p-6 rounded-xl text-white shadow-lg text-center overflow-hidden"
    >
      {/* Contenedor de las burbujas animadas */}
      <div className="absolute inset-0 z-0">
        {/* Burbujas más grandes con animaciones y duraciones variadas */}
        <span className="bubble" style={{ left: '5%', width: '50px', height: '50px', animationName: 'bubble-rise-1', animationDuration: '25s' }}></span>
        <span className="bubble" style={{ left: '15%', width: '30px', height: '30px', animationName: 'bubble-rise-2', animationDelay: '3s', animationDuration: '18s' }}></span>
        <span className="bubble" style={{ left: '25%', width: '60px', height: '60px', animationName: 'bubble-rise-3', animationDelay: '5s', animationDuration: '22s' }}></span>
        <span className="bubble" style={{ left: '40%', width: '20px', height: '20px', animationName: 'bubble-rise-1', animationDelay: '1s', animationDuration: '30s' }}></span>
        <span className="bubble" style={{ left: '55%', width: '70px', height: '70px', animationName: 'bubble-rise-2', animationDelay: '0s', animationDuration: '15s' }}></span>
        <span className="bubble" style={{ left: '75%', width: '40px', height: '40px', animationName: 'bubble-rise-3', animationDelay: '6s', animationDuration: '20s' }}></span>
        <span className="bubble" style={{ left: '90%', width: '25px', height: '25px', animationName: 'bubble-rise-1', animationDelay: '8s', animationDuration: '28s' }}></span>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10">
        <h2 className="text-3xl md:text-2xl font-bold mb-2">
          Ready to Check Your English Level?
        </h2>
        <p className="text-indigo-100 max-w-2xl mx-auto mb-6 md:mb-5 text-lg">
          Take our diagnostic test to evaluate your skills and receive personalized feedback
        </p>
        <button
          onClick={onNewTest}
          className="bg-white text-blue-600 font-semibold px-8 py-3 md:py-2.5 rounded-lg shadow-md hover:bg-slate-100 transition-transform transform hover:scale-105"
        >
          <span>Start New Test</span>
          <ArrowRight className="inline ml-2 h-5 w-5" />
        </button>
      </div>

      {/* Estilos CSS para las animaciones aleatorias */}
      <style jsx>{`
        .bubble {
          position: absolute;
          bottom: -100px;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes bubble-rise-1 {
          0% {
            transform: translate(0, 0);
            opacity: 0.7;
          }
          50% {
            transform: translate(20px, -50vh);
            opacity: 0.5;
          }
          100% {
            transform: translate(-10px, -100vh);
            opacity: 0;
          }
        }

        @keyframes bubble-rise-2 {
          0% {
            transform: translate(0, 0);
            opacity: 0.7;
          }
          40% {
            transform: translate(-30px, -40vh);
            opacity: 0.6;
          }
          100% {
            transform: translate(10px, -100vh);
            opacity: 0;
          }
        }

        @keyframes bubble-rise-3 {
          0% {
            transform: translate(0, 0);
            opacity: 0.6;
          }
          100% {
            transform: translate(0, -100vh);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default NewTestPrompt;