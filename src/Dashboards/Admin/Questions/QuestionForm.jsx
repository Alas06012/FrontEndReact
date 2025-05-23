import React, { useState, useEffect } from 'react';
import { API_URL } from '/config.js';
import { getAccessToken } from '../../../Utils/auth';
import Alert from '../../../Components/Alert';
const token = getAccessToken();

const QuestionForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [questionText, setQuestionText] = useState('');
  const [questionTypeFk, setQuestionTypeFk] = useState('');
  const [level_id, setQuestionLevelFk] = useState('');
  const [toeic_section_id, setSectionFk] = useState('');
  const [title_id, setTitleFk] = useState('');
  const [answers, setAnswers] = useState([{ text: '', is_correct: false }]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [titles, setTitles] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);
  const showAlert = (text, icon = 'success') => {
    Alert({ title: icon === 'error' ? 'Error' : 'Éxito', text, icon });
  };
  // Mapeo de datos al editar
  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.question_text || '');
      setQuestionTypeFk(initialData.question_type_fk || '');
      setQuestionLevelFk(initialData.level_id || '');
      setSectionFk(initialData.toeic_section_id || '');
      setTitleFk(initialData.title_id || '');

      const mappedAnswers = (initialData.answers || []).map((ans) => ({
        pk_answer: ans.pk_answer || null,
        text: ans.answer_text || '',
        is_correct: !!ans.is_correct,
      }));

      setAnswers(mappedAnswers.length ? mappedAnswers : [{ text: '', is_correct: false }]);
    }
  }, [initialData]);

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
    fetchCatalog('sections', setSections, 'sections');
  }, []);

  const handleAnswerChange = (index, field, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index][field] = value;
    setAnswers(updatedAnswers);
  };

  const addAnswer = () => {
    setAnswers([...answers, { text: '', is_correct: false }]);
  };

  const removeAnswer = (index) => {
    setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!answers.some((a) => a.is_correct)) {
      showAlert('Debe marcar al menos una respuesta como correcta.', 'error');
      return;
    }

    const payload = {
      question_text: questionText,
      question_type_fk: questionTypeFk,
      level_id,
      toeic_section_id,
      title_id,
      answers,
    };

    onSubmit(payload);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
       {/*  <h2 className="text-2xl font-bold text-gray-800">
          {initialData?.pk_question ? 'Edit Question' : 'New Question'}
        </h2> */}

        <div className="md:col-span-6">
          <label className="block mb-1 font-medium">Title</label>
          <select
            value={title_id}
            onChange={(e) => setTitleFk(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select a title</option>
            {titles.map((t) => (
              <option key={t.pk_title} value={t.pk_title}>
                {t.title_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Question</label>
          <input
            type="text"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Level</label>
          <select
            value={level_id}
            onChange={(e) => setQuestionLevelFk(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select a level</option>
            {levels.map((l) => (
              <option key={l.pk_level} value={l.pk_level}>
                {l.level_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Section</label>
          <select
            value={toeic_section_id}
            onChange={(e) => setSectionFk(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="">Select a section</option>
            {sections.map((s) => (
              <option key={s.section_pk} value={s.section_pk}>
                {s.section_desc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Answers</label>
          {answers.map((ans, idx) => (
            <div key={ans.pk_answer || `new-${idx}`} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                placeholder={`Answer ${idx + 1}`}
                value={ans.text}
                onChange={(e) => handleAnswerChange(idx, 'text', e.target.value)}
                className="flex-1 px-3 py-2 border rounded"
                required
              />
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="correct-answer"
                  className="mr-1"
                  checked={ans.is_correct}
                  onChange={() => {
                    const updatedAnswers = answers.map((a, i) => ({
                      ...a,
                      is_correct: i === idx,
                    }));
                    setAnswers(updatedAnswers);
                  }}
                />
                Correct
              </label>
              {answers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAnswer(idx)}
                  className="text-red-600 hover:text-red-800 text-lg font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAnswer}
            className="text-blue-600 font-medium hover:underline mt-2"
          >
            + Add answer
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            {initialData?.pk_question ? 'Update' : 'Create'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default QuestionForm;
