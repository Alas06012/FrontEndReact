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
        {form.type === 'LISTENING' && (
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
