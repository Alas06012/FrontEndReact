import React, { useState, useEffect } from 'react';
import { API_URL } from '/config.js';
import Alert from '../../../Components/Alert';
import { getAccessToken } from '../../../Utils/auth';
import QuestionForm from './QuestionForm';
import QuestionTable from './QuestionTable';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
                <button
                    className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black"
                    onClick={onClose}
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, question }) => {
    if (!isOpen || !question) return null;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
                ¿Estás seguro de que deseas {question.status === 'ACTIVE' ? 'desactivar' : 'activar'} esta pregunta?
            </h2>
            <p className="mb-6 text-gray-600">{question.question_text}</p>
            <div className="flex justify-end gap-4">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                <button onClick={() => onConfirm(question)} className="px-4 py-2 bg-red-600 text-white rounded-lg">Confirmar</button>
            </div>
        </Modal>
    );
};

const QuestionsAdmin = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [questionToToggle, setQuestionToToggle] = useState(null);

    const token = getAccessToken();

    const showAlert = (text, icon = 'success') => {
        Alert({ title: icon === 'error' ? 'Error' : 'Éxito', text, icon });
    };

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/questions-per-title`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    page,
                    per_page: 10,
                    status: 'ACTIVE',
                }),
            });

            if (!response.ok) throw new Error('Error al cargar las preguntas');
            const data = await response.json();
            console.log(data);
            setQuestions(data.questions || []);
            setTotalPages(data.pagination?.total_pages || 1);
            setError(null);
        } catch (err) {
            setError(err.message);
            showAlert(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (typingTimeout) clearTimeout(typingTimeout);
        const timeout = setTimeout(() => {
            fetchQuestions();
        }, 500);
        setTypingTimeout(timeout);
    }, [search, page]);

    const handleEdit = (question) => {
        setSelectedQuestion(question);
        setShowForm(true);
    };

    const handleCancel = () => {
        setSelectedQuestion(null);
        setShowForm(false);
    };

    const handleSubmit = async (formData) => {
        try {
            console.log("aca",selectedQuestion);
            const method = selectedQuestion ? 'PUT' : 'POST';
            const endpoint = `${API_URL}/question`;
            const payload = selectedQuestion
                ? { question_id: selectedQuestion.pk_question, ...formData }
                : formData;
                console.log(formData);
            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Error al guardar la pregunta');

            await fetchQuestions();
            showAlert(selectedQuestion ? 'Pregunta actualizada' : 'Pregunta creada');
            handleCancel();
        } catch (err) {
            showAlert(err.message, 'error');
        }
    };

    const requestToggleStatus = (question) => {
        setQuestionToToggle(question);
        setShowConfirm(true);
    };

    const handleToggleStatus = async (question) => {
        try {
            const newStatus = question.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            const response = await fetch(`${API_URL}/question/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ question_id: question.pk_question, status: newStatus }),
            });

            if (!response.ok) throw new Error('Error al actualizar estado');

            await fetchQuestions();
            showAlert(`Pregunta ${newStatus === 'ACTIVE' ? 'activada' : 'desactivada'}`);
        } catch (err) {
            showAlert(err.message, 'error');
        } finally {
            setShowConfirm(false);
            setQuestionToToggle(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">Gestión de Preguntas</h1>

            <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-1/2">
                    <input
                        type="text"
                        placeholder="Buscar preguntas..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                </div>

                <button
                    onClick={() => {
                        setSelectedQuestion(null);
                        setShowForm(true);
                    }}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" /> Pregunta
                </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Cargando...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : questions.length === 0 ? (
                <p className="text-center text-gray-500">No hay preguntas disponibles.</p>
            ) : (
                <>
                    <QuestionTable
                        questions={questions}
                        onEdit={handleEdit}
                        onToggleStatus={requestToggleStatus}
                    />

                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-300"
                        >
                            Anterior
                        </button>

                        <span className="text-gray-600 font-semibold">
                            Página {page} de {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-300"
                        >
                            Siguiente
                        </button>
                    </div>
                </>
            )}

            <Modal isOpen={showForm} onClose={handleCancel}>
                <QuestionForm
                    onSubmit={handleSubmit}
                    initialData={selectedQuestion}
                    onCancel={handleCancel}
                />
            </Modal>

            <ConfirmModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleToggleStatus}
                question={questionToToggle}
            />
        </div>
    );
};

export default QuestionsAdmin;
