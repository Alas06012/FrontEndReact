import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal';
import { Clock, HelpCircle, Wifi, MicOff, Lock, AlertTriangle, Repeat, FileText, CheckCircle } from 'lucide-react';

const ToeicInstructionsModal = ({ isOpen, onClose, onCreateTest }) => {
    const [language, setLanguage] = useState('en');

    const instructionsData = {
        en: [
            { icon: Clock, text: "The test lasts 2 hours (120 minutes): 50 Listening and 50 Reading questions." },
            { icon: HelpCircle, text: "Carefully answer all 100 multiple-choice questions." },
            { icon: Wifi, text: "A stable internet connection is essential throughout the test." },
            { icon: MicOff, text: "Use a quiet, distraction-free environment to ensure focus." },
            { icon: Lock, text: "Once the test is submitted, you cannot change your answers." },
            { icon: CheckCircle, text: "It is important to answer all questions to achieve a good result." },
            { icon: Repeat, text: "You are allowed only three (3) test attempts per day.", important: true },
            { icon: AlertTriangle, text: "If you close the test without completing it, one attempt will be consumed.", important: true },
        ],
        es: [
            { icon: Clock, text: "El examen dura 2 horas (120 minutos): 50 preguntas de Listening y 50 de Reading." },
            { icon: HelpCircle, text: "Responde cuidadosamente las 100 preguntas de opción múltiple." },
            { icon: Wifi, text: "Es indispensable una conexión estable a internet durante todo el examen." },
            { icon: MicOff, text: "Usa un ambiente silencioso y sin distracciones para asegurar tu concentración." },
            { icon: Lock, text: "Una vez enviado el examen, no podrás modificar tus respuestas." },
            { icon: CheckCircle, text: "Es importante contestar todas las preguntas para obtener un buen resultado." },
            { icon: Repeat, text: "Solo dispones de tres (3) intentos por día para realizar el examen.", important: true },
            { icon: AlertTriangle, text: "Si cierras el examen antes de completarlo, se consumirá un intento.", important: true },
        ]
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        // Se define una transición más fluida para la animación de entrada
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.07,
                duration: 0.4,
                ease: "easeOut" // Curva de animación suave
            }
        }),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <motion.div
                className="flex flex-col h-full"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
            >
                {/* --- Encabezado --- */}
                <header className="flex-shrink-0 p-6 border-b border-slate-200">
                    <motion.div variants={itemVariants} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100/70 p-3 rounded-full">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {language === 'es' ? 'Instrucciones del Examen' : 'Test Instructions'}
                                </h2>
                                <p className="text-sm text-slate-500">TOEIC Listening & Reading</p>
                            </div>
                        </div>
                        <div className="flex space-x-2 p-1 bg-slate-100 rounded-lg">
                            <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>EN</button>
                            <button onClick={() => setLanguage('es')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'es' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:bg-slate-200'}`}>ES</button>
                        </div>
                    </motion.div>
                </header>

                {/* --- Contenido (Instrucciones) --- */}
                <main className="flex-grow p-6 overflow-y-auto">
                    <motion.ul className="space-y-4">
                        {/* No se necesita AnimatePresence aquí si la lista solo cambia de contenido */}
                        {instructionsData[language].map((item, index) => (
                            <motion.li
                                key={`${language}-${index}`} // La key asegura que el elemento se re-renderice al cambiar idioma
                                custom={index} // Pasa el índice a las variantes
                                variants={itemVariants}
                                className={`flex items-start gap-4 p-3 rounded-lg ${item.important ? 'bg-amber-50 border border-amber-200' : ''}`}
                                whileHover={{ scale: 1.02 }}
                                // Se añade una transición específica para el HOVER, haciéndolo instantáneo
                                transition={{ duration: 0.15 }}
                            >
                                <div className={`flex-shrink-0 mt-0.5 ${item.important ? 'text-amber-500' : 'text-blue-500'}`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <span className={`text-sm ${item.important ? 'text-amber-800 font-semibold' : 'text-slate-700'}`}>
                                    {item.text}
                                </span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </main>

                {/* --- Pie de Página (Acciones) --- */}
                <footer className="flex-shrink-0 p-6 border-t border-slate-200 bg-slate-50">
                    <motion.div variants={itemVariants} className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="bg-transparent hover:bg-slate-200 text-slate-800 font-semibold py-2 px-6 rounded-lg transition-colors"
                        >
                            {language === 'es' ? 'Cancelar' : 'Cancel'}
                        </button>
                        <button
                            onClick={() => {
                                onClose();
                                onCreateTest();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-sm hover:shadow-md transition-all"
                        >
                            {language === 'es' ? 'Comenzar Examen' : 'Start Test'}
                        </button>
                    </motion.div>
                </footer>
            </motion.div>
        </Modal>
    );
};

export default ToeicInstructionsModal;