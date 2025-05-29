import React from 'react';
import Modal from '../../Components/Modal';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon } from '@heroicons/react/24/solid';

const TestResultModal = ({ isOpen, onClose, resultData }) => {
  if (!resultData) return null;

  const {
    user_name,
    user_lastname,
    user_email,
    level_name,
    date,
    score,
    test_passed,
    strengths,
    weaknesses,
    recommendations,
  } = resultData;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-gray-800">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">Resultado del Test</h2>

        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6">
          <div>
            <p className="text-lg"><span className="font-semibold">Estudiante:</span> {user_name} {user_lastname}</p>
            <p className="text-lg"><span className="font-semibold">Email:</span> {user_email}</p>
            <p className="text-lg"><span className="font-semibold">Nivel:</span> {level_name}</p>
          </div>
          <div>
            <p className="text-lg"><span className="font-semibold">Fecha:</span> {date ? new Date(date).toLocaleString() : 'N/A'}</p>
            <p className="text-lg"><span className="font-semibold">Resultado:</span> {score ?? 'N/A'} / 100</p>
            <p className="flex items-center text-lg font-semibold">
              Estado:&nbsp;
              {test_passed ? (
                <>
                  <CheckCircleIcon className="w-6 h-6 text-green-600" /> 
                  <span className="ml-1 text-green-700">Aprobado</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                  <span className="ml-1 text-red-700">Reprobado</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Fortalezas */}
          <section className="bg-green-50 border border-green-300 rounded-lg p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-green-700 mb-3 flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2" /> Fortalezas
            </h3>
            {strengths?.length > 0 ? (
              <ul className="list-disc list-inside text-green-800 space-y-1">
                {strengths.map((s) => (
                  <li key={s.id} className="leading-snug">{s.text}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-green-600">No se identificaron fortalezas destacadas.</p>
            )}
          </section>

          {/* Debilidades */}
          <section className="bg-red-50 border border-red-300 rounded-lg p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-red-700 mb-3 flex items-center">
              <XCircleIcon className="w-6 h-6 mr-2" /> Debilidades
            </h3>
            {weaknesses?.length > 0 ? (
              <ul className="list-disc list-inside text-red-800 space-y-1">
                {weaknesses.map((w) => (
                  <li key={w.id} className="leading-snug">{w.text}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-red-600">No se identificaron debilidades destacadas.</p>
            )}
          </section>

          {/* Recomendaciones */}
          <section className="bg-blue-50 border border-blue-300 rounded-lg p-5 shadow-sm">
            <h3 className="text-xl font-semibold text-blue-700 mb-3 flex items-center">
              <LightBulbIcon className="w-6 h-6 mr-2" /> Recomendaciones
            </h3>
            {recommendations?.length > 0 ? (
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                {recommendations.map((r) => (
                  <li key={r.id} className="leading-snug">{r.text}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-blue-600">No se proporcionaron recomendaciones específicas.</p>
            )}
          </section>

        </div>

        {/* Close Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-300 ease-in-out"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TestResultModal;
