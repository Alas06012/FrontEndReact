import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from '../Modal.jsx';
import Alert from '../Alert.jsx';

const Timer = ({ timeLeft, totalTime }) => {
    const percentage = (timeLeft / totalTime) * 100;
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mb-6">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700">Tiempo restante</span>
                <span className="text-sm font-mono text-red-600 font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
                <motion.div
                    className="bg-red-600 h-4 rounded-full"
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
            </div>
        </div>
    );
};

const TestFormModal = ({ isOpen, onClose, testData, onSubmit, initialTime, testStarted }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [responses, setResponses] = useState({});
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [showMobilePagination, setShowMobilePagination] = useState(false);
    const questionTopRef = useRef(null);

    useEffect(() => {
        if (isOpen && testData) {
            setCurrentPage(0);
            setResponses({});
            setTimeLeft(initialTime);
            setShowMobilePagination(false);
        }
    }, [testData?.test_id, isOpen]);

    const allTitlesWithSection = useMemo(() => {
        if (!testData?.sections) return [];
        let counter = 1;
        return testData.sections.flatMap(section =>
            section.titles.map(title => ({
                ...title,
                section_desc: section.section_desc,
                section_type: section.section_type,
                questions: title.questions.map(q => ({
                    ...q,
                    globalIndex: counter++,
                }))
            }))
        );
    }, [testData]);

    const totalPages = allTitlesWithSection.length;
    const currentTitle = allTitlesWithSection[currentPage];

    useEffect(() => {
        if (!testData) return;
        const initialResponses = {};
        testData.sections.forEach(section => {
            section.titles.forEach(title => {
                title.questions.forEach(question => {
                    if (question.selected_answer_id !== null && question.selected_answer_id !== undefined) {
                        initialResponses[question.question_id] = question.selected_answer_id;
                    }
                });
            });
        });
        setResponses(initialResponses);
    }, [testData]);

    useEffect(() => {
        if (!testStarted) return;
        if (timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [testStarted, timeLeft]);

    const handleAnswerChange = (questionId, answerId) => {
        setResponses(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => {
                setTimeout(() => {
                    questionTopRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 0);
                return prev + 1;
            });
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const toggleMobilePagination = () => {
        setShowMobilePagination(prev => !prev);
    };

    const handleQuestionNavigation = (titleIndex) => {
        setCurrentPage(titleIndex);
        setTimeout(() => {
            questionTopRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
        // Eliminamos el cierre automático del panel
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const totalQuestions = allTitlesWithSection.reduce((acc, t) => acc + t.questions.length, 0);
        const answeredCount = Object.keys(responses).length;
        const isComplete = answeredCount === totalQuestions;
        const detalles = allTitlesWithSection.flatMap(title =>
            title.questions.map(question => ({
                question_id: question.question_id,
                title_id: title.title_id,
                user_answer_id: responses[question.question_id] || null,
            }))
        );

        if (!isComplete) {
            const result = await Alert({
                title: 'There are unanswered questions',
                text: 'Are you sure you want to submit the test?',
                icon: 'warning',
                type: 'confirm',
                confirmButtonText: 'Yes, submit',
                cancelButtonText: 'Cancel',
                background: '#1e293b',
                color: 'white',
            });
            if (!result.isConfirmed) return;
        }
        onSubmit({
            test_id: testData.test_id,
            detalles,
        });
    };

    if (!isOpen || !testData || totalPages === 0) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Test: ${testData.test_id}`}
            size="5xl"
            height="95vh"
        >
            <div className="flex flex-col lg:flex-row h-auto lg:h-[80vh] gap-4 p-4 overflow-auto">
                <div className="flex-1 overflow-y-auto pr-2 lg:border-r">
                    <form onSubmit={handleSubmit} className="space-y-10 px-1 sm:px-2 md:px-4" ref={questionTopRef}>
                        <div className="border-b border-gray-300 pb-2">
                            <h3 className="text-xl text-gray-600 font-bold tracking-wide uppercase">
                                {currentTitle.section_desc} ({currentTitle.section_type})
                            </h3>
                        </div>
                        <div className="space-y-6">
                            <h4 className="text-xl sm:text-2xl font-semibold text-blue-700 leading-snug">
                                {currentTitle.title_name}
                            </h4>
                            {currentTitle.title_url && (
                                <audio controls src={currentTitle.title_url} className="w-full my-3 rounded shadow" />
                            )}
                            {currentTitle.section_type !== 'LISTENING' && currentTitle.title_test && (
                                <pre className="bg-blue-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap font-medium shadow-sm border border-blue-100">
                                    {currentTitle.title_test}
                                </pre>
                            )}
                            {currentTitle.questions.map((question, qIndex) => {
                                const globalQuestionNumber = allTitlesWithSection
                                    .slice(0, currentPage)
                                    .reduce((acc, title) => acc + title.questions.length, 0) + qIndex + 1;
                                return (
                                    <motion.div
                                        key={question.question_id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white border border-gray-200 p-5 rounded-2xl shadow transition hover:shadow-md"
                                    >
                                        <p className="text-sm text-gray-500 font-semibold mb-1">
                                            Pregunta {globalQuestionNumber} de {
                                                allTitlesWithSection.reduce((acc, t) => acc + t.questions.length, 0)
                                            }
                                        </p>
                                        <p className="text-base sm:text-lg font-semibold text-gray-800 mb-3">{question.question_text}</p>
                                        <div className="space-y-2">
                                            {question.answers.map((answer) => (
                                                <motion.label
                                                    key={answer.answer_id}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={`flex items-center px-4 py-2 rounded-xl border transition cursor-pointer
                                                    ${responses[question.question_id] === answer.answer_id
                                                            ? 'bg-blue-100 border-blue-500 text-blue-800 font-semibold'
                                                            : 'bg-gray-50 hover:bg-gray-100 border-gray-300'
                                                        }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question_${question.question_id}`}
                                                        value={answer.answer_id}
                                                        checked={responses[question.question_id] === answer.answer_id}
                                                        onChange={() => handleAnswerChange(question.question_id, answer.answer_id)}
                                                        className="mr-3 accent-blue-600"
                                                    />
                                                    {answer.answer_text}
                                                </motion.label>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        <div className="flex justify-between items-center pt-8 border-t border-gray-300">
                            <motion.button
                                type="button"
                                onClick={handlePrev}
                                disabled={currentPage === 0}
                                whileTap={{ scale: currentPage === 0 ? 1 : 0.95 }}
                                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold transition
                                    ${currentPage === 0
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                Anterior
                            </motion.button>
                            {currentPage === totalPages - 1 ? (
                                <motion.button
                                    type="button"
                                    onClick={handleSubmit} 
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                                >
                                    Enviar respuestas
                                </motion.button>
                            ) : (
                                <motion.button
                                    type="button"
                                    onClick={handleNext}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                                >
                                    Siguiente
                                </motion.button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Desktop Pagination - Optimized grid */}
                <div className="hidden lg:flex lg:w-56 flex-col mt-6 lg:mt-0 space-y-3 mb-3">
                    {testStarted && <Timer timeLeft={timeLeft} totalTime={initialTime} />}
                    <div className="text-md text-gray-600 font-semibold">Progreso por pregunta</div>
                    <div className="grid grid-cols-6 gap-1.5 overflow-y-auto max-h-[calc(100%-80px)] pr-1 mb-3 pb-4">
                        {allTitlesWithSection.flatMap((title, titleIndex) =>
                            title.questions.map((question, qIndex) => {
                                const questionNumber = allTitlesWithSection
                                    .slice(0, titleIndex)
                                    .reduce((acc, t) => acc + t.questions.length, 0) + qIndex + 1;
                                const isAnswered = responses[question.question_id];
                                return (
                                    <motion.button
                                        key={question.question_id}
                                        onClick={() => handleQuestionNavigation(titleIndex)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className={`h-8 text-[13px] rounded-md font-bold transition-colors
                                            ${isAnswered
                                                ? 'bg-blue-600 text-white hover:bg-blue-500'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {questionNumber}
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Mobile floating button */}
                <motion.button
                    onClick={toggleMobilePagination}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="fixed lg:hidden bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-50"
                >
                    <span className="text-xl font-bold">{Object.keys(responses).length}</span>
                </motion.button>

                {/* Mobile pagination - Optimized */}
                <AnimatePresence>
                    {showMobilePagination && (
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25 }}
                            className="fixed lg:hidden inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-40 p-4 h-[55vh]"
                        >
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-bold text-gray-800">
                                    Preguntas ({Object.keys(responses).length}/{allTitlesWithSection.reduce((acc, t) => acc + t.questions.length, 0)})
                                </h3>
                                <button 
                                    onClick={() => setShowMobilePagination(false)}
                                    className="text-gray-500 p-1"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {testStarted && (
                                <div className="mb-3">
                                    <Timer timeLeft={timeLeft} totalTime={initialTime} />
                                </div>
                            )}

                            <div className="grid grid-cols-6 gap-2 overflow-y-auto h-[calc(100%-90px)] p-3">
                                {allTitlesWithSection.flatMap((title, titleIndex) =>
                                    title.questions.map((question, qIndex) => {
                                        const questionNumber = allTitlesWithSection
                                            .slice(0, titleIndex)
                                            .reduce((acc, t) => acc + t.questions.length, 0) + qIndex + 1;
                                        const isAnswered = responses[question.question_id];
                                        const isCurrent = currentPage === titleIndex &&
                                            currentTitle.questions.some(q => q.question_id === question.question_id);

                                        return (
                                            <motion.button
                                                key={question.question_id}
                                                onClick={() => handleQuestionNavigation(titleIndex)}
                                                whileTap={{ scale: 0.95 }}
                                                className={`h-10 text-xs rounded-md flex items-center justify-center transition-all
                                                    ${isCurrent ? 'ring-2 ring-blue-500' : ''}
                                                    ${isAnswered
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {questionNumber}
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Modal>
    );
};

export default TestFormModal;