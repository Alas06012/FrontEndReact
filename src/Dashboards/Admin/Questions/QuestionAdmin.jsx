import React, { useState, useEffect } from 'react';
import { API_URL } from '/config.js';
import { getAccessToken } from '../../../Utils/auth.js';
import Alert from '../../../Components/Alert.jsx';
import Table from '../../../Components/Table.jsx';
import Pagination from '../../../Components/Pagination.jsx';
import Modal from '../../../Components/Modal.jsx';
import QuestionForm from './QuestionForm.jsx';
import { Edit, XCircle, CheckCircle, Search, Plus } from 'lucide-react'; // Añadimos el icono Search

const QuestionsAdmin = () => {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [questions, setQuestions] = useState([]);
    const [pagination, setPagination] = useState({ total_pages: 1, current_page: 1 });
    const [perPage, setPerPage] = useState(10);
    const [filters, setFilters] = useState({
        searchText: '',
        status: 'Todos',
        title_id: '',
        level_id: '',
        toeic_section_id: '',
    });
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [titles, setTitles] = useState([]);
    const [levels, setLevels] = useState([]);
    const [toeicSections, setToeicSections] = useState([]);

    const token = getAccessToken();

    const showErrorAlert = (message) => {
        Alert({
            title: 'Error',
            text: message,
            icon: 'error',
            background: '#1e293b',
            color: 'white',
        });
    };

    const fetchQuestions = async (page = 1, per_page = perPage) => {
        try {
            const body = {
                page,
                per_page,
                status: filters.status !== 'ALL' ? filters.status : undefined,
                title_id: filters.title_id || undefined,
                level_id: filters.level_id || undefined,
                toeic_section_id: filters.toeic_section_id || undefined,
                search_text: filters.searchText || undefined,
            };
            Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);

            const response = await fetch(`${API_URL}/questions-per-title`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error al obtener preguntas');

            setQuestions(data.questions || []);
            setPagination({
                total_pages: data.pagination?.total_pages || 1,
                current_page: page,
            });
        } catch (error) {
            showErrorAlert(error.message);
        }
    };

    useEffect(() => {
        const fetchCatalog = async (endpoint, setter, key) => {
            try {
                const res = await fetch(`${API_URL}/${endpoint}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ page, search }),
                });

                if (!res.ok) throw new Error(`Error al cargar ${endpoint}`);
                const data = await res.json();
                setter(data[key] || []);
            } catch (err) {
                console.error(`Error en ${endpoint}:`, err.message);
            }
        };

        fetchCatalog('stories', setTitles, 'titles');
        fetchCatalog('levels', setLevels, 'levels');
        fetchCatalog('sections', setToeicSections, 'sections');
    }, [token, page, search]);  // Añadir dependencias necesarias

    useEffect(() => {
        fetchQuestions(pagination.current_page, perPage);
    }, [
        pagination.current_page,
        perPage,
        filters.status,
        filters.searchText,
        filters.title_id,
        filters.level_id,
        filters.toeic_section_id,
    ]);

    const openForm = (question = null) => {
        setSelectedQuestion(question);
        setShowForm(true);
    };

    const handleCancel = () => {
        setSelectedQuestion(null);
        setShowForm(false);
    };

    const handleSubmit = async (formData) => {
        try {
            const method = selectedQuestion ? 'PUT' : 'POST';
            const endpoint = `${API_URL}/question`;

            const payload = selectedQuestion
                ? { question_id: selectedQuestion.pk_question, ...formData }
                : formData;

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Error al guardar la pregunta');

            Alert({
                title: 'Éxito',
                text: result.message || 'Pregunta guardada correctamente',
                icon: 'success',
                background: '#1e293b',
                color: 'white',
            });

            setShowForm(false);
            setSelectedQuestion(null);
            fetchQuestions(pagination.current_page, perPage);
        } catch (error) {
            showErrorAlert(error.message);
        }
    };

    const toggleStatus = async (question) => {
        const isActive = question.status === 'ACTIVE';
        const result = await Alert({
            title: '¿Estás seguro?',
            text: `¿Deseas ${isActive ? 'desactivar' : 'activar'} la pregunta: "${question.question_text}"?`,
            icon: 'question',
            type: 'confirm',
            confirmButtonText: 'Sí',
            cancelButtonText: 'Cancelar',
            showCancelButton: true,
            background: '#1e293b',
            color: 'white',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`${API_URL}/question`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        question_id: question.pk_question,
                        status: isActive ? 'INACTIVE' : 'ACTIVE',
                    }),
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || 'Error al cambiar estado');

                Alert({
                    title: 'Éxito',
                    text: data.message || 'Estado actualizado',
                    icon: 'success',
                    background: '#1e293b',
                    color: 'white',
                });

                fetchQuestions(pagination.current_page, perPage);
            } catch (error) {
                showErrorAlert(error.message);
            }
        }
    };

    const handleSearchChange = (e) => {
        setFilters((prev) => ({ ...prev, searchText: e.target.value }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handleClearSearch = () => {
        setFilters((prev) => ({ ...prev, searchText: '' }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handleStatusChange = (e) => {
        setFilters((prev) => ({ ...prev, status: e.target.value }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handleFieldChange = (e, field) => {
        setFilters((prev) => ({ ...prev, [field]: e.target.value }));
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const handleClearAllFilters = () => {
        setFilters({
            searchText: '',
            status: 'Todos',
            title_id: '',
            level_id: '',
            toeic_section_id: '',
        });
        setPagination((prev) => ({ ...prev, current_page: 1 }));
    };

    const inputClass = 'p-2 border rounded-md';

    const tableColumns = [
        { header: 'ID', key: 'pk_question' },
        { header: 'Texto', key: 'question_text' },
        {
            header: 'Estado',
            render: (q) => (
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${q.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {q.status}
                </span>
            ),
        },
    ];

    const actionRender = (question) => (
        <div className="flex gap-2">
            <button onClick={() => openForm(question)} className="text-blue-600 hover:text-blue-800" title="Editar">
                <Edit className="h-5 w-5" />
            </button>
            {question.status === 'ACTIVE' ? (
                <button onClick={() => toggleStatus(question)} className="text-red-500 hover:text-red-700" title="Desactivar">
                    <XCircle className="h-5 w-5" />
                </button>
            ) : (
                <button onClick={() => toggleStatus(question)} className="text-green-500 hover:text-green-700" title="Activar">
                    <CheckCircle className="h-5 w-5" />
                </button>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
            <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-center mb-6 text-black">Question Management</h1>

                <div className="mb-6 space-y-6">
                    <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-700">
                        <Search className="h-5 w-5" /> Filters
                    </h2>

                    {/* Search + clear */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <input
                            type="text"
                            placeholder="Search by text..."
                            className={`${inputClass} w-full sm:w-1/2`}
                            value={filters.searchText}
                            onChange={handleSearchChange}
                        />
                        <button
                            onClick={handleClearSearch}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <XCircle className="h-5 w-5" /> Clear search
                        </button>
                    </div>

                    {/* Filters grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <select className={inputClass} value={filters.status} onChange={handleStatusChange}>
                            <option value="ALL">All</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        <select className={inputClass} value={filters.title_id} onChange={(e) => handleFieldChange(e, 'title_id')}>
                            <option value="">Select a Title</option>
                            {titles.map((title) => (
                                <option key={title.pk_title} value={title.pk_title}>{title.title_name}</option>
                            ))}
                        </select>

                        <select className={inputClass} value={filters.level_id} onChange={(e) => handleFieldChange(e, 'level_id')}>
                            <option value="">Select a Level</option>
                            {levels.map((level) => (
                                <option key={level.pk_level} value={level.pk_level}>{level.level_name}</option>
                            ))}
                        </select>

                        <select className={inputClass} value={filters.toeic_section_id} onChange={(e) => handleFieldChange(e, 'toeic_section_id')}>
                            <option value="">Select a Section</option>
                            {toeicSections.map((section) => (
                                <option key={section.section_pk} value={section.section_pk}>{section.section_desc}</option>
                            ))}
                        </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                        <button
                            onClick={handleClearAllFilters}
                            className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600 transition duration-300"
                        >
                            Clear all filters
                        </button>

                        <button
                            onClick={() => openForm()}
                            className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 flex items-center gap-2"
                        >
                            <Plus className="h-5 w-5" /> New Question
                        </button>
                    </div>
                </div>

                <Modal isOpen={showForm} onClose={handleCancel} title={selectedQuestion ? 'Edit Question' : 'New Question'}>
                    <QuestionForm onSubmit={handleSubmit} initialData={selectedQuestion} onCancel={handleCancel} />
                </Modal>

                <Table columns={tableColumns} data={questions} onAction={actionRender} />

                <Pagination
                    currentPage={pagination.current_page}
                    totalPages={pagination.total_pages}
                    onPageChange={(page) => setPagination((prev) => ({ ...prev, current_page: page }))}
                    perPage={perPage}
                    setPerPage={setPerPage}
                    onPerPageChange={(e) => {
                        const newValue = parseInt(e.target.value, 10);
                        setPerPage(newValue);
                        setPagination((prev) => ({ ...prev, current_page: 1 }));
                        fetchQuestions(1, newValue);
                    }}
                />
            </div>
        </div>
    );
};

export default QuestionsAdmin;
