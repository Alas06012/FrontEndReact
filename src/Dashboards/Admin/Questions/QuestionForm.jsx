import React, { useState, useEffect } from 'react';
import { API_URL } from '/config.js';
import { getAccessToken } from '../../../Utils/auth';
import Alert from '../../../Components/Alert';
import Loader from '../../../Components/Loader';
import SearchableSelect from '../../../Components/SearchableSelect';
import { Plus } from 'lucide-react';

const token = getAccessToken();

const QuestionForm = ({ onSubmit, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    questionText: '',
    questionTypeFk: '',
    level_id: '',
    toeic_section_id: '',
    title_id: '',
    answers: [{ text: '', is_correct: false }]
  });
  const [loading, setLoading] = useState({
    catalogs: true,
    submitting: false
  });
  const [error, setError] = useState(null);

  const [titles, setTitles] = useState([]);
  const [levels, setLevels] = useState([]);
  const [sections, setSections] = useState([]);

  const showAlert = (text, icon = 'success') => {
    Alert({ title: icon === 'error' ? 'Error' : 'Éxito', text, icon });
  };

  // Mapeo de datos al editar
  useEffect(() => {
    if (initialData) {
      setFormData({
        questionText: initialData.question_text || '',
        questionTypeFk: initialData.question_type_fk || '',
        level_id: initialData.level_id || '',
        toeic_section_id: initialData.toeic_section_id || '',
        title_id: initialData.title_id || '',
        answers: (initialData.answers || []).map(ans => ({
          pk_answer: ans.pk_answer || null,
          text: ans.answer_text || '',
          is_correct: !!ans.is_correct,
        })) || [{ text: '', is_correct: false }]
      });
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCatalog = async (endpoint, setter, key) => {
      try {
        const per_page = 1000;
        const res = await fetch(`${API_URL}/${endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ page: 1, per_page, search: '' }),
        });

        if (!res.ok) throw new Error(`Error loading ${endpoint}`);
        const data = await res.json();
        setter(data[key] || []);
        return true;
      } catch (err) {
        console.error(`Error in ${endpoint}:`, err.message);
        setError(`Failed to load ${endpoint}`);
        return false;
      }
    };

    const loadCatalogs = async () => {
      setLoading(prev => ({ ...prev, catalogs: true }));
      setError(null);
      
      try {
        const results = await Promise.all([
          fetchCatalog('stories', setTitles, 'titles'),
          fetchCatalog('levels', setLevels, 'levels'),
          fetchCatalog('sections', setSections, 'sections')
        ]);
        
        if (results.some(success => !success)) {
          showAlert('Some catalogs failed to load', 'error');
        }
      } catch (err) {
        showAlert('Error loading catalogs', 'error');
      } finally {
        setLoading(prev => ({ ...prev, catalogs: false }));
      }
    };

    loadCatalogs();
  }, []);

  const handleAnswerChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.map((ans, i) => 
        i === index ? { ...ans, [field]: value } : ans
      )
    }));
  };

  const addAnswer = () => {
    setFormData(prev => ({
      ...prev,
      answers: [...prev.answers, { text: '', is_correct: false }]
    }));
  };

  const removeAnswer = (index) => {
    setFormData(prev => ({
      ...prev,
      answers: prev.answers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, submitting: true }));

    if (!formData.answers.some(a => a.is_correct)) {
      showAlert('Debe marcar al menos una respuesta como correcta.', 'error');
      setLoading(prev => ({ ...prev, submitting: false }));
      return;
    }

    const payload = {
      question_text: formData.questionText,
      question_type_fk: formData.questionTypeFk,
      level_id: formData.level_id,
      toeic_section_id: formData.toeic_section_id,
      title_id: formData.title_id,
      answers: formData.answers,
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading.catalogs) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader size="lg" />
        <p className="mt-4 text-gray-600">Loading catalogs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        <p>{error}</p>
        <button 
          onClick={onCancel}
          className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="md:col-span-6">
          <label className="block mb-1 font-medium text-gray-700">Title</label>
          <SearchableSelect
            options={titles.map(t => ({
              value: t.pk_title,
              label: t.title_name
            }))}
            value={formData.title_id}
            onChange={(value) => handleFieldChange('title_id', value)}
            placeholder="Select a title"
            disabled={loading.submitting || loading.catalogs}
            loading={loading.catalogs}
            className="w-full"
            noOptionsMessage="No titles available"
          />
        </div>

        <div>
          <label className="block font-medium mb-1 text-gray-700">Question</label>
          <input
            type="text"
            value={formData.questionText}
            onChange={(e) => handleFieldChange('questionText', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={loading.submitting}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Level</label>
          <SearchableSelect
            options={levels.map(l => ({
              value: l.pk_level,
              label: l.level_name
            }))}
            value={formData.level_id}
            onChange={(value) => handleFieldChange('level_id', value)}
            placeholder="Select a level"
            disabled={loading.submitting || loading.catalogs}
            loading={loading.catalogs}
            className="w-full"
            noOptionsMessage="No levels available"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-gray-700">Section</label>
          <SearchableSelect
            options={sections.map(s => ({
              value: s.section_pk,
              label: s.section_desc
            }))}
            value={formData.toeic_section_id}
            onChange={(value) => handleFieldChange('toeic_section_id', value)}
            placeholder="Select a section"
            disabled={loading.submitting || loading.catalogs}
            loading={loading.catalogs}
            className="w-full"
            noOptionsMessage="No sections available"
          />
        </div>

        <div>
          <label className="block font-medium mb-2 text-gray-700">Answers</label>
          {formData.answers.map((ans, idx) => (
            <div key={ans.pk_answer || `new-${idx}`} className="flex items-center gap-3 mb-2">
              <input
                type="text"
                placeholder={`Answer ${idx + 1}`}
                value={ans.text}
                onChange={(e) => handleAnswerChange(idx, 'text', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={loading.submitting}
              />
              <label className="flex items-center text-sm gap-1">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={ans.is_correct}
                  onChange={() => {
                    const updatedAnswers = formData.answers.map((a, i) => ({
                      ...a,
                      is_correct: i === idx,
                    }));
                    handleFieldChange('answers', updatedAnswers);
                  }}
                  disabled={loading.submitting}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className={loading.submitting ? 'text-gray-400' : ''}>Correct</span>
              </label>
              {formData.answers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAnswer(idx)}
                  className={`text-red-600 hover:text-red-800 text-lg font-bold ${loading.submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={loading.submitting}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addAnswer}
            className={`text-blue-600 font-medium hover:underline mt-2 flex items-center gap-1 ${loading.submitting || formData.answers.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading.submitting || formData.answers.length >= 4}
          >
            <Plus className="h-4 w-4" /> Add answer
            {formData.answers.length >= 4 && <span className="text-xs text-gray-500 ml-1">(max 4)</span>}
          </button>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded ${loading.submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading.submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded flex items-center justify-center min-w-24 ${loading.submitting ? 'opacity-75' : ''}`}
            disabled={loading.submitting}
          >
            {loading.submitting ? (
              <>
                <Loader size="sm" className="mr-2 text-white" />
                {initialData?.pk_question ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              initialData?.pk_question ? 'Update' : 'Create'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;