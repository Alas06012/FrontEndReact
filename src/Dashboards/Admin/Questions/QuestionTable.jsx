// src/Dashboards/Admin/Questions/QuestionTable.jsx
import React from 'react';
import { PencilIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

const QuestionTable = ({ questions, onEdit, onToggleStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Titles</th>
            <th className="px-4 py-2 text-left">Pregunta</th>
            <th className="px-4 py-2 text-left">Nivel</th>
            <th className="px-4 py-2 text-left">Secction</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q) => (
            <tr key={q.pk_question} className="border-t hover:bg-blue-50 transition-colors">
              <td className="px-4 py-2">{q.title_name}</td>
              <td className="px-4 py-2">{q.question_text}</td>
              <td className="px-4 py-2">{q.level_name}</td>
              <td className="px-4 py-2">{q.type_section}</td>
              <td className="px-4 py-2 space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${q.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}
                >
                  {q.status}
                </span>
              </td>
              <td className="py-3 px-6 text-center space-x-4">
                <button
                  onClick={() => onEdit(q)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                  title="Editar pregunta"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onToggleStatus(q)}
                  className={`p-2 rounded-lg focus:outline-none ${q.status === 'ACTIVE'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                    }`}
                  title={q.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                >
                  {q.status === 'ACTIVE' ? (
                    <LockClosedIcon className="w-5 h-5" />
                  ) : (
                    <LockOpenIcon className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionTable;
