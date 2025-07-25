import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '/config.js';
import { getAccessToken } from '../../../Utils/auth.js';

import Modal from '../../../Components/Modal.jsx';
import Alert from '../../../Components/Alert.jsx';
import { BrainCircuit, Loader2, ChevronLeft, Save, Wand2, ChevronDown } from 'lucide-react';

const AIGeneratorModal = ({ isOpen, onClose, onSaveSuccess }) => {
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [generatedContent, setGeneratedContent] = useState(null);
    const [mcerLevels, setMcerLevels] = useState([]);
    const [toeicSections, setToeicSections] = useState([]);
    const [generationParams, setGenerationParams] = useState(null);
    const token = getAccessToken();
    const [validationErrors, setValidationErrors] = useState([]);

    const validateContent = () => {
        const errors = [];

        if (!generatedContent.title_name.trim()) {
            errors.push({ field: 'title_name', message: 'Title name is required' });
        }

        if (!generatedContent.title_test.trim()) {
            errors.push({ field: 'title_test', message: 'Content is required' });
        }

        generatedContent.questions.forEach((question, qIndex) => {
            if (!question.question_text.trim()) {
                errors.push({
                    field: `question_${qIndex}_text`,
                    message: `Question ${qIndex + 1} text is required`
                });
            }

            const correctAnswers = question.answers.filter(a => a.is_correct).length;
            if (correctAnswers !== 1) {
                errors.push({
                    field: `question_${qIndex}_correct`,
                    message: `Question ${qIndex + 1} must have exactly one correct answer`
                });
            }

            question.answers.forEach((answer, aIndex) => {
                if (!answer.answer_text.trim()) {
                    errors.push({
                        field: `question_${qIndex}_answer_${aIndex}`,
                        message: `Answer ${aIndex + 1} for question ${qIndex + 1} is required`
                    });
                }
            });
        });

        return errors.length === 0 ? true : errors;
    };

    // Form state
    const [generationFormData, setGenerationFormData] = useState({
        level_fk: '',
        title_type: 'READING',
        toeic_section_fk: '',
        topic: ''
    });
    const [filteredToeicSections, setFilteredToeicSections] = useState([]);

    useEffect(() => {
        if (generationFormData.title_type) {
            const filtered = toeicSections.filter(section =>
                section.label.startsWith(generationFormData.title_type)
            );
            setFilteredToeicSections(filtered);
            setGenerationFormData(prev => ({
                ...prev,
                toeic_section_fk: ''
            }));
        }
    }, [generationFormData.title_type, toeicSections]);

    const showAlert = (text, icon = 'success') => {
        Alert({
            title: icon === 'error' ? 'Error' : 'Éxito',
            text,
            icon,
            color: 'white'
        });
    };

    useEffect(() => {
        if (isOpen && mcerLevels.length === 0) {
            fetchSelectOptions();
        }
    }, [isOpen]);

    const fetchSelectOptions = async () => {
        try {
            const [levelsRes, sectionsRes] = await Promise.all([
                fetch(`${API_URL}/levels`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }),
                fetch(`${API_URL}/sections`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                })
            ]);

            const levelsData = await levelsRes.json();
            const sectionsData = await sectionsRes.json();

            if (levelsRes.ok) {
                setMcerLevels(levelsData.levels.map(l => ({
                    value: l.pk_level,
                    label: `${l.level_name} - ${l.level_desc}`
                })));
            }

            if (sectionsRes.ok) {
                setToeicSections(sectionsData.sections.map(s => ({
                    value: s.section_pk,
                    label: `${s.type_}: ${s.section_desc}`
                })));
            }
        } catch (err) {
            showAlert('Error loading generator options', 'error');
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setGenerationFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    /**
      * 
      * GENERACION DE CONTENIDO MANUAL
      * 
      */
    const handleManualEntry = (e) => {
        e.preventDefault();

        // Valida que los campos requeridos estén llenos
        if (!generationFormData.level_fk || !generationFormData.title_type || !generationFormData.toeic_section_fk || !generationFormData.topic) {
            showAlert('Please select level, type, section and topic before proceeding.', 'error');
            return;
        }

        // Crea una plantilla de contenido vacío
        const manualTemplate = {
            title_name: '',
            title_test: '',
            title_type: generationFormData.title_type,
            questions: Array.from({ length: 4 }, () => ({
                question_text: '',
                answers: Array.from({ length: 4 }, () => ({
                    answer_text: '',
                    is_correct: false // Todas comienzan como falsas
                }))
            }))
        };
        // Marcamos la primera respuesta como correcta en las 4 preguntas
        manualTemplate.questions[0].answers[0].is_correct = true;
        manualTemplate.questions[1].answers[0].is_correct = true;
        manualTemplate.questions[2].answers[0].is_correct = true;
        manualTemplate.questions[3].answers[0].is_correct = true;

        // Guarda los parámetros y establece el contenido vacío para mostrar el editor
        setGenerationParams(generationFormData);
        setGeneratedContent(manualTemplate);
    };

    /**
     * 
     * GENERACION DE CONTENIDO CON IA
     * 
     */
    const handleGenerateQuiz = async (e) => {
        e.preventDefault();
        setIsLoadingAI(true);
        setGenerationParams(generationFormData);
        try {
            const response = await fetch(`${API_URL}/ai/generate-quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(generationFormData),
            });
            const result = await response.json();
            setIsLoadingAI(false);
            if (response.ok) {
                showAlert('Content generated. Review and edit as needed.');
                setGeneratedContent(result.data);
            } else {
                showAlert(result.message || 'Error from AI server', 'error');
            }
        } catch (err) {
            setIsLoadingAI(false);
            showAlert('Network error during generation', 'error');
        }
    };

    const handleSaveQuiz = async () => {
        if (!generatedContent || !generationParams) return;

        const validationResult = validateContent();
        if (validationResult !== true) {
            setValidationErrors(validationResult);

            // Mostrar el primer error
            if (validationResult.length > 0) {
                showAlert(validationResult[0].message, 'error');
            }

            return;
        }

        setValidationErrors([]);
        setIsLoadingAI(true);

        try {
            const payload = {
                quiz_data: generatedContent,
                level_fk: generationParams.level_fk,
                toeic_section_fk: generationParams.toeic_section_fk,
            };

            const response = await fetch(`${API_URL}/ai/save-quiz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            setIsLoadingAI(false);

            if (response.ok) {
                showAlert('Content saved successfully!');
                handleClose(false);
                onSaveSuccess();
            } else {
                showAlert(result.message || 'Could not save content', 'error');
            }
        } catch (err) {
            setIsLoadingAI(false);
            showAlert('Network error during save', 'error');
        }
    };

    const handleContentChange = (e, questionIndex = null, answerIndex = null) => {
        const { name, value, type } = e.target;

        setGeneratedContent(prev => {
            const newContent = JSON.parse(JSON.stringify(prev));

            if (questionIndex === null) {
                // Cambio en el título o contenido principal
                newContent[name] = value;
            } else if (answerIndex === null) {
                // Cambio en el texto de la pregunta
                newContent.questions[questionIndex][name] = value;
            } else {
                if (name === 'is_correct') {
                    // Reset all answers to false first
                    newContent.questions[questionIndex].answers.forEach(ans => {
                        ans.is_correct = false;
                    });
                    // Set only the selected answer to true
                    newContent.questions[questionIndex].answers[answerIndex].is_correct = true;
                } else {
                    // Cambio en el texto de una respuesta
                    newContent.questions[questionIndex].answers[answerIndex][name] = value;
                }
            }
            return newContent;
        });
    };

    const handleClose = (showConfirmation = true) => {
        setGeneratedContent(null);
        setGenerationParams(null);
        onClose(showConfirmation);
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={

            <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                    <BrainCircuit className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-semibold text-md sm:text-lg">AI Content Generator</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Select parameters to generate content
                    </p>
                </div>
            </div>
        } size="xl">
            {isLoadingAI ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 gap-4"
                >
                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                    <p className="text-gray-600">
                        {!generatedContent ? "Generating content with AI..." : "Saving your content..."}
                    </p>
                </motion.div>
            ) : !generatedContent ? (
                <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleGenerateQuiz}
                    className="space-y-6"
                >


                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty Level (MCER)
                            </label>
                            <select
                                name="level_fk"
                                value={generationFormData.level_fk}
                                onChange={handleFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            >
                                <option value="">Select a level</option>
                                {mcerLevels.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {['READING', 'LISTENING'].map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setGenerationFormData(prev => ({
                                            ...prev,
                                            title_type: type
                                        }))}
                                        className={`px-4 py-2 rounded-lg border transition-all ${generationFormData.title_type === type
                                            ? 'bg-purple-100 border-purple-500 text-purple-700 font-medium'
                                            : 'border-gray-300 hover:bg-gray-50'}`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section
                            </label>
                            <select
                                name="toeic_section_fk"
                                value={generationFormData.toeic_section_fk}
                                onChange={handleFormChange}
                                required
                                disabled={!generationFormData.title_type}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="">Select a section</option>
                                {filteredToeicSections.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Topic
                            </label>
                            <input
                                name="topic"
                                value={generationFormData.topic}
                                placeholder='Food, Books, Cinema...'
                                onChange={handleFormChange}
                                required
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                            </input>
                        </div>
                    </div>


                    {/* CONTENEDOR DE BOTONES */}
                    <div className="flex justify-end items-center pt-2 gap-3">
                        {/* Botón para entrada manual */}
                        <button
                            type="button" // Importante que sea type="button" para no enviar el form
                            onClick={handleManualEntry}
                            className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
                        >
                            Enter Manually
                        </button>

                        {/* Botón principal para generar con IA */}
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:shadow-md transition-all"
                        >
                            <Wand2 className="h-4 w-4" />
                            Generate with AI
                        </motion.button>
                    </div>
                </motion.form>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 max-h-[88vh] overflow-y-auto pr-2"
                >
                    <div className="sticky top-0 bg-white pb-4 pt-2 border-b border-slate-400">
                        <button
                            onClick={() => setGeneratedContent(null)}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to parameters
                        </button>
                        <h3 className="text-lg font-semibold mt-2">Review Generated Content</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title Name
                            </label>
                            <input
                                type="text"
                                name="title_name"
                                value={generatedContent.title_name}
                                onChange={handleContentChange}
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${validationErrors.some(e => e.field === 'title_name')
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                    }`} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Content / Script
                            </label>
                            <textarea
                                name="title_test"
                                value={generatedContent.title_test}
                                onChange={handleContentChange}
                                rows="8"
                                placeholder={
                                    generationParams.title_type === 'LISTENING'
                                        ? "default: Context description\nperson 1: Dialogue...\nperson 2: Response..."
                                        : "Write content here"
                                }
                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${validationErrors.some(e => e.field === 'title_name')
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300'
                                    }`} />
                            {generationParams.title_type === 'LISTENING' && (
                                <div className="mt-2">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            backgroundColor: isHelpOpen ? '#f0f9ff' : '#eff6ff',
                                            borderColor: isHelpOpen ? '#93c5fd' : '#dbeafe'
                                        }}
                                        className="p-3 rounded-lg border cursor-pointer"
                                        onClick={() => setIsHelpOpen(!isHelpOpen)}
                                    >
                                        <motion.div
                                            className="flex items-center justify-between"
                                            initial={false}
                                        >
                                            <span className="font-medium text-gray-700">
                                                Format required for LISTENING
                                            </span>
                                            <motion.div
                                                animate={{ rotate: isHelpOpen ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                            </motion.div>
                                        </motion.div>

                                        <AnimatePresence>
                                            {isHelpOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{
                                                        height: "auto",
                                                        opacity: 1,
                                                        transition: {
                                                            height: { duration: 0.3 },
                                                            opacity: { duration: 0.2, delay: 0.1 }
                                                        }
                                                    }}
                                                    exit={{
                                                        height: 0,
                                                        opacity: 0,
                                                        transition: {
                                                            height: { duration: 0.2 },
                                                            opacity: { duration: 0.1 }
                                                        }
                                                    }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
                                                        <ul className="list-disc pl-5 space-y-1 text-gray-600">
                                                            <li>Start by defining actors with the format:</li>
                                                            <ul className="list-[circle] pl-5 mt-1 space-y-1">
                                                                <li>person 1: Male voice</li>
                                                                <li>person 2: Female voice</li>
                                                                <li>person 3: Female voice</li>
                                                                <li>person 4: Male voice</li>
                                                            </ul>
                                                            <li>Use <code className="bg-blue-100 px-1 rounded text-indigo-800">default</code> for narrator</li>
                                                            <li>In the script, each line must start with the actor's name</li>
                                                        </ul>

                                                        <motion.div
                                                            className="mt-3 p-2 bg-white border rounded text-xs"
                                                            initial={{ y: -10, opacity: 0 }}
                                                            animate={{
                                                                y: 0,
                                                                opacity: 1,
                                                                transition: { delay: 0.2 }
                                                            }}
                                                        >
                                                            <p className="font-medium text-gray-700">Example:</p>
                                                            <pre className="whitespace-pre-wrap mt-1 text-gray-700 text-xs">
                                                                {`default: Three friends discuss weekend plans\nperson 1: Hey Sarah and Emma, do you have any plans?\nperson 2: Not really, Tom. I was thinking of relaxing...`}
                                                            </pre>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </div>
                            )}

                            <div className="border-t pt-3 mt-3 border-slate-500">
                                <h3 className="text-lg font-semibold mb-4">Questions</h3>
                                <div className="space-y-4">
                                    {generatedContent.questions.map((q, qIndex) => (
                                        <motion.div
                                            key={qIndex}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: qIndex * 0.05 }}
                                            className="p-4 border border-gray-200 rounded-lg space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <label className="block text-sm font-medium text-gray-700">
                                                Question {qIndex + 1}
                                            </label>
                                            <textarea
                                                name="question_text"
                                                value={q.question_text}
                                                onChange={(e) => handleContentChange(e, qIndex)}
                                                rows="2"
                                                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${validationErrors.some(e => e.field === 'title_name')
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-gray-300'
                                                    }`} />
                                            <div className="space-y-2 mt-3">
                                                <label className="block text-sm font-medium text-gray-700">
                                                    Answers (select the correct one)
                                                </label>
                                                {q.answers.map((ans, aIndex) => (
                                                    <div
                                                        key={aIndex}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`is_correct_${qIndex}`}
                                                            checked={ans.is_correct}
                                                            onChange={() => {
                                                                // Creamos un evento sintético para mantener la misma interfaz
                                                                const syntheticEvent = {
                                                                    target: {
                                                                        name: 'is_correct',
                                                                        value: true
                                                                    }
                                                                };
                                                                handleContentChange(syntheticEvent, qIndex, aIndex);
                                                            }}
                                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        <input
                                                            type="text"
                                                            name="answer_text"
                                                            value={ans.answer_text}
                                                            onChange={(e) => handleContentChange(e, qIndex, aIndex)}
                                                            className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all ${validationErrors.some(e => e.field === 'title_name')
                                                                ? 'border-red-500 bg-red-50'
                                                                : 'border-gray-300'
                                                                }`} />
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-white pt-4 border-t border-slate-400 flex justify-end gap-3">
                            <button
                                onClick={() => setGeneratedContent(null)}
                                className="flex items-center gap-2 px-5 py-2 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Regenerate
                            </button>
                            <motion.button
                                onClick={handleSaveQuiz}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:shadow-md transition-all"
                            >
                                <Save className="h-4 w-4" />
                                Save Content
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            )}
        </Modal>
    );
};

export default AIGeneratorModal;