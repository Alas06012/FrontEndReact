import React from 'react';
import { PencilIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';

const TitleTable = ({ titles, onEdit, onToggleStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left">Título</th>
            <th className="px-4 py-2 text-left">Tipo</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {titles.map((title) => (
            <tr key={title.pk_title} className="border-b hover:bg-gray-100">
              <td className="px-4 py-2">{title.title_name}</td>
              <td className="px-4 py-2">{title.title_type}</td>
              <td className="px-4 py-2">{title.status}</td>
              <td className="px-4 py-2 space-x-2">
                <button
                  onClick={() => onEdit(title)}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
                  title="Editar título"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onToggleStatus(title)}
                  className={`p-2 text-white rounded-lg focus:outline-none ${
                    title.status === 'ACTIVE'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  title={title.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                >
                  {title.status === 'ACTIVE' ? (
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

export default TitleTable;
