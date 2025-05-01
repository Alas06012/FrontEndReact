import React, { useState, useEffect } from 'react';
import {
  PencilIcon,
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
  DocumentCheckIcon,
} from '@heroicons/react/24/outline'; // Importamos los íconos necesarios

const TitleForm = ({ onSubmit, initialData, onCancel }) => {
  const [form, setForm] = useState({
    title: '',
    content: '',
    type: 'READING',
    url: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title_name,
        content: initialData.title_test,
        type: initialData.title_type,
        url: initialData.title_url || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ title: '', content: '', type: 'READING', url: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-gray-700 font-semibold">Título</label>
        <input
          id="title"
          name="title"
          placeholder="Título"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-gray-700 font-semibold">Contenido</label>
        <textarea
          id="content"
          name="content"
          placeholder="Contenido"
          value={form.content}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-gray-700 font-semibold">Tipo</label>
        <div className="relative">
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="READING">READING</option>
            <option value="LISTENING">LISTENING</option>
          </select>
        </div>
      </div>

      {form.type === 'LISTENING' && (
        <div>
          <label htmlFor="url" className="block text-gray-700 font-semibold">URL de audio</label>
          <input
            id="url"
            name="url"
            placeholder="URL de audio"
            value={form.url}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          title={initialData ? 'Actualizar' : 'Crear'}
          aria-label={initialData ? 'Actualizar' : 'Crear'}
        >
          {initialData ? (
            <DocumentCheckIcon className="w-5 h-5" />
          ) : (
            <PlusIcon className="w-5 h-5" />
          )}
        </button>

        {initialData && (
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition"
            title="Cancelar"
            aria-label="Cancelar"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}
      </div>

    </form>
  );
};

export default TitleForm;
