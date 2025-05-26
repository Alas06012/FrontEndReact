// src/Components/TestFormModal.jsx
import React, { useState } from 'react';
import Modal from '../Components/Modal.jsx';

const TestFormModal = ({ isOpen, onClose, testData, onSubmit }) => {
    if (!isOpen || !testData || !testData.sections) return null;

    const allTitlesWithSection = testData.sections.flatMap(section =>
        section.titles.map(title => ({
            ...title,
            section_desc: section.section_desc,
            section_type: section.section_type,
        }))
    );

    const [currentPage, setCurrentPage] = useState(0);
    const [responses, setResponses] = useState({});

    const totalPages = allTitlesWithSection.length;
    if (totalPages === 0) return null;

    const currentTitle = allTitlesWithSection[currentPage];

    const handleAnswerChange = (questionId, answerId) => {
        setResponses(prev => ({ ...prev, [questionId]: answerId }));
    };

    const handleNext = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const handlePrev = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Construir el arreglo de detalles con question_id, title_id y user_answer_id
        // Recorrer todos los títulos con sección y sus preguntas para crear el arreglo completo
        const detalles = allTitlesWithSection.flatMap(title => 
            title.questions.map(question => ({
                question_id: question.question_id,
                title_id: title.title_id,            // debe existir en title
                user_answer_id: responses[question.question_id] || null, // puede ser null si no respondida
            }))
        );

        // Opcional: filtrar las preguntas sin respuesta para no enviar
        // const detallesFiltrados = detalles.filter(d => d.user_answer_id !== null);

        // Enviar objeto con test_id y detalles
        onSubmit({
            test_id: testData.test_id,
            detalles, // o detallesFiltrados si filtras sin respuestas vacías
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Test: ${testData.test_id}`}
            size="2xl"
            height="95vh"
        >
            <form onSubmit={handleSubmit} className="space-y-10 p-6 max-h-[80vh] overflow-y-auto">
                <div className="border-b border-gray-300 pb-2">
                    <h3 className="text-xl text-gray-600 font-bold tracking-wide uppercase">
                        {currentTitle.section_desc} ({currentTitle.section_type})
                    </h3>
                </div>

                <div className="space-y-6">
                    <h4 className="text-2xl font-semibold text-blue-700 leading-snug">
                        {currentTitle.title_name}
                    </h4>

                    {currentTitle.title_url && (
                        <audio controls src={currentTitle.title_url} className="w-full my-3 rounded shadow" />
                    )}

                    <pre className="bg-blue-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap font-medium shadow-sm border border-blue-100">
                        {currentTitle.title_test}
                    </pre>

                    {currentTitle.questions.map((question) => (
                        <div
                            key={question.question_id}
                            className="bg-white border border-gray-200 p-5 rounded-2xl shadow transition hover:shadow-md"
                        >
                            <p className="font-semibold text-gray-800 text-lg mb-3">{question.question_text}</p>

                            <div className="space-y-2">
                                {question.answers.map((answer) => (
                                    <label
                                        key={answer.answer_id}
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
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-gray-300">
                    <button
                        type="button"
                        onClick={handlePrev}
                        disabled={currentPage === 0}
                        className={`px-5 py-2.5 rounded-xl font-semibold transition
                            ${currentPage === 0
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        Anterior
                    </button>

                    {currentPage === totalPages - 1 ? (
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                        >
                            Enviar respuestas
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleNext}
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold transition"
                        >
                            Siguiente
                        </button>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default TestFormModal;
