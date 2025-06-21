import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal'; // Asumiendo que tienes un componente Modal

const ToeicInstructionsModal = ({ isOpen, onClose, onCreateTest }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'es' : 'en');
  };

  // Animaciones
  const modalVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.05, duration: 0.3 }
    })
  };

  const instructions = {
    en: [
      "The TOEIC Online Listening and Reading test lasts 2 hours (120 minutes): 50 Listening questions and 50 Reading questions.",
      "Carefully answer all 100 multiple-choice questions.",
      "A stable internet connection throughout the test is essential.",
      "Use a quiet environment free of distractions to ensure focus.",
      "Once the test is submitted, you cannot change your answers.",
      "No unauthorized aids or devices are allowed during the exam.",
      "It is important to answer all questions; otherwise, you will not achieve a good result.",
      "You are allowed only three (3) test attempts per day.",
      "If you close the test without completing it, one attempt will be consumed and your answers will not be submitted or evaluated."
    ],
    es: [
      "El examen TOEIC Online Listening and Reading dura 2 horas (120 minutos): 50 preguntas de Listening y 50 de Reading.",
      "Responde cuidadosamente las 100 preguntas de opción múltiple.",
      "Es indispensable tener una conexión estable a internet durante todo el examen.",
      "Usa un ambiente silencioso y sin distracciones para asegurar tu concentración.",
      "Una vez enviado el examen, no podrás modificar tus respuestas.",
      "No está permitido usar ayudas o dispositivos no autorizados durante el examen.",
      "Es importante contestar todas las preguntas, de lo contrario no obtendrás un buen resultado.",
      "Solo dispones de tres (3) intentos por día para realizar el examen.",
      "Si cierras el examen antes de completarlo, se consumirá un intento y tus respuestas no serán enviadas ni evaluadas."
    ]
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <motion.div
        className="p-6"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {language === 'es' ? 'Instrucciones TOEIC' : 'TOEIC Test Instructions'}
        </h2>

        <div className="w-full flex justify-end mb-6">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            onClick={toggleLanguage}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-14 h-6 bg-gray-200 rounded-full">
              <motion.div
                className={`absolute top-1 w-4 h-4 rounded-full ${language === 'es' ? 'bg-blue-500 right-1' : 'bg-gray-500 left-1'
                  }`}
                animate={{
                  x: language === 'es' ? '0.01rem' : '0',
                  backgroundColor: language === 'es' ? '#3B82F6' : '#6B7280'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </div>
            <span className="text-gray-700 font-medium">
              {language === 'es' ? 'Español' : 'English'}
            </span>
          </motion.div>
        </div>

        <motion.ul className="space-y-3 mb-8">
          {instructions[language].map((item, index) => (
            <motion.li
              key={index}
              custom={index}
              variants={itemVariants}
              className="flex items-start text-gray-700"
            >
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
              <span>{item}</span>
            </motion.li>
          ))}
        </motion.ul>

        <div className="flex justify-end gap-4">
          <motion.button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </motion.button>
          <motion.button
            onClick={() => {
              onClose();
              onCreateTest();
            }}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md"
            whileHover={{ scale: 1.03, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.97 }}
          >
            {language === 'es' ? 'Comenzar Examen' : 'Start Test'}
          </motion.button>
        </div>
      </motion.div>
    </Modal>
  );
};

export default ToeicInstructionsModal;