import React from 'react';
import Modal from '../../Components/Modal';
import { CheckCircleIcon, XCircleIcon, LightBulbIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { exportResultDetailToPDF } from '../../utils/exportUtils';


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

  const renderList = (items, colorClass, emptyText) => (
    items?.length > 0 ? (
      <ul className={`list-disc list-inside ${colorClass} space-y-2 font-medium leading-relaxed`}>
        {items.map((item) => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    ) : (
      <p className={`italic ${colorClass.replace('900', '700')}`}>{emptyText}</p>
    )
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}  size="5xl" height="95vh">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-10 text-gray-900 font-sans">
        <h2 className="text-4xl font-extrabold mb-8 text-center bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 text-transparent bg-clip-text">
          Test Result
        </h2>

        {/* Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 border-b border-gray-200 pb-8">
          <div className="space-y-3">
            <p className="text-lg"><span className="font-semibold text-gray-700">Student:</span> {user_name} {user_lastname}</p>
            <p className="text-lg"><span className="font-semibold text-gray-700">Email:</span> {user_email}</p>
            <p className="text-lg"><span className="font-semibold text-gray-700">Level:</span> {level_name}</p>
          </div>
          <div className="space-y-3">
            <p className="text-lg"><span className="font-semibold text-gray-700">Date:</span> {date ? new Date(date).toLocaleString() : 'N/A'}</p>
            <p className="text-lg"><span className="font-semibold text-gray-700">Score:</span> {score ?? 'N/A'}</p>
            <p className="flex items-center text-lg font-semibold">
              Status:&nbsp;
              {test_passed ? (
                <>
                  <CheckCircleIcon className="w-7 h-7 text-green-600" />
                  <span className="ml-2 text-green-800">Passed</span>
                </>
              ) : (
                <>
                  <XCircleIcon className="w-7 h-7 text-red-600" />
                  <span className="ml-2 text-red-800">Failed</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Horizontal Cards */}
        <div className="space-y-8">
          {/* Strengths */}
          <section className="bg-gradient-to-tr from-green-100 to-green-50 border border-green-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6">
            <div className="flex-shrink-0 text-green-800">
              <LightBulbIcon className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-3">Strengths</h3>
              {renderList(strengths, 'text-green-900', 'No notable strengths identified.')}
            </div>
          </section>

          {/* Weaknesses */}
          <section className="bg-gradient-to-tr from-red-100 to-red-50 border border-red-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6">
            <div className="flex-shrink-0 text-red-800">
              <XCircleIcon className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-3">Weaknesses</h3>
              {renderList(weaknesses, 'text-red-900', 'No notable weaknesses identified.')}
            </div>
          </section>

          {/* Recommendations */}
          <section className="bg-gradient-to-tr from-blue-100 to-blue-50 border border-blue-300 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-start space-x-6">
            <div className="flex-shrink-0 text-blue-800">
              <LightBulbIcon className="w-10 h-10" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-semibold mb-3">Recommendations</h3>
              {renderList(recommendations, 'text-blue-900', 'No specific recommendations provided.')}
            </div>
          </section>
        </div>
{/* Action Buttons (PDF & Close) */}
<div className="mt-12 flex justify-center gap-6">
  <button
    onClick={() => exportResultDetailToPDF(resultData, `test_result_${resultData.user_lastname}`)}
    className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-10 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300 flex items-center gap-2"
  >
    <ArrowDownTrayIcon className="w-5 h-5" />
    PDF
  </button>

  <button
    onClick={onClose}
    className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-4 px-10 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300"
  >
    Cerrar
  </button>
</div>


      </div>
    </Modal>
  );
};

export default TestResultModal;
