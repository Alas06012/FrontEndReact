import React from 'react';
import Modal from '../../Components/Modal';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { exportResultDetailToPDF } from '../../Utils/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Componente para items individuales
  const ResultItem = ({ item, color }) => (
    <motion.div
      className={`mb-4 p-3 py-3 border-l-4 ${color.border} bg-white rounded-r-lg shadow-sm`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ x: 5 }}
    >
      <div className="flex items-start">
        <div className={`flex-shrink-0 mt-1 mr-4 ${color.icon}`}>
          {color.iconComponent}
        </div>
        <div className="flex-grow">
          <p className={`text-md md:text-lg font-medium ${color.text}`}>{item.text}</p>
          {item.details && (
            <p className="mt-2 text-gray-600">{item.details}</p>
          )}
        </div>
      </div>
    </motion.div>
  );

  // Componente para secciones expandibles
  const ExpandableSection = ({ title, items, emptyText, color }) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    
    return (
      <motion.div
        className={`rounded-xl ${color.bg} p-6 mb-6 shadow-md hover:shadow-lg transition-shadow`}
        whileHover={{ y: -3 }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between focus:outline-none group"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center">
            <motion.div
              className={`p-3 rounded-xl ${color.iconBg} mr-4 shadow-sm`}
              animate={isExpanded ? "hidden" : "visible"}
              variants={{
                visible: { opacity: 1, scale: 1 },
                hidden: { opacity: 0, scale: 0 }
              }}
              transition={{ duration: 0.2 }}
            >
              {color.iconComponent}
            </motion.div>
            <h3 className={`text-lg md:text-2xl font-bold ${color.title}`}>{title}</h3>
          </div>
          <motion.div
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={{
              expanded: { rotate: 0, opacity: 1 },
              collapsed: { rotate: -90, opacity: 0.8 }
            }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className={`w-6 h-6 ${isExpanded ? 'text-gray-700' : 'text-gray-500'}`} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { 
                  opacity: 1,
                  height: "auto",
                  transition: { 
                    when: "beforeChildren",
                    staggerChildren: 0.1
                  }
                },
                collapsed: { 
                  opacity: 0,
                  height: 0,
                  transition: { 
                    when: "afterChildren"
                  }
                }
              }}
              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
              className="mt-6 pl-4"
            >
              {items?.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <ResultItem 
                      key={item.id} 
                      item={item} 
                      color={color}
                    />
                  ))}
                </div>
              ) : (
                <p className={`italic text-lg ${color.emptyText} pl-4`}>{emptyText}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  // Configuración de colores y estilos
  const sectionTypes = {
    strengths: {
      border: "border-emerald-300",
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-100",
      icon: "text-emerald-600",
      title: "text-emerald-800",
      text: "text-emerald-900",
      emptyText: "text-emerald-600",
      iconComponent: <LightBulbIcon className="w-6 h-6" />
    },
    weaknesses: {
      border: "border-rose-300",
      bg: "bg-gradient-to-br from-rose-50 to-rose-100",
      iconBg: "bg-rose-100",
      icon: "text-rose-600",
      title: "text-rose-800",
      text: "text-rose-900",
      emptyText: "text-rose-600",
      iconComponent: <XCircleIcon className="w-6 h-6" />
    },
    recommendations: {
      border: "border-blue-300",
      bg: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-blue-100",
      icon: "text-blue-600",
      title: "text-blue-800",
      text: "text-blue-900",
      emptyText: "text-blue-600",
      iconComponent: <LightBulbIcon className="w-6 h-6" />
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="7xl">
      <div className="mx-auto bg-white rounded-2xl overflow-hidden max-w-7xl">
        {/* Main Content */}
        <div className="p-10 text-gray-800 font-sans">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-purple-700 mb-2">Test Result Summary</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 mx-auto rounded-full"></div>
          </div>
          
          {/* User Info Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
            <div className="bg-white border border-gray-400 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-400">Student Information</h3>
              <div className="space-y-4">
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Name:</span>
                  <span className="ml-3 font-semibold">{user_name} {user_lastname}</span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Email:</span>
                  <span className="ml-3 font-semibold">{user_email}</span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Level:</span>
                  <span className="ml-3 font-semibold">{level_name}</span>
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-400 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-400">Test Details</h3>
              <div className="space-y-4">
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Date:</span>
                  <span className="ml-3 font-semibold">{date ? new Date(date).toLocaleString() : 'N/A'}</span>
                </p>
                <p className="text-lg">
                  <span className="font-medium text-gray-600">Score:</span>
                  <span className="ml-3 font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent text-xl">
                    {score ?? 'N/A'}
                  </span>
                </p>
                <p className="flex items-center text-lg">
                  <span className="font-medium text-gray-600">Status:</span>
                  <span className="ml-3 flex items-center">
                    {test_passed ? (
                      <>
                        <CheckCircleIcon className="w-7 h-7 text-emerald-500" />
                        <span className="ml-2 font-semibold text-emerald-700">Passed</span>
                      </>
                    ) : (
                      <>
                        <XCircleIcon className="w-7 h-7 text-rose-500" />
                        <span className="ml-2 font-semibold text-rose-700">Failed</span>
                      </>
                    )}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Sections */}
          <div className="space-y-6">
            <ExpandableSection
              title="Strengths"
              items={strengths}
              emptyText="No notable strengths identified."
              color={sectionTypes.strengths}
            />

            <ExpandableSection
              title="Weaknesses"
              items={weaknesses}
              emptyText="No notable weaknesses identified."
              color={sectionTypes.weaknesses}
            />

            <ExpandableSection
              title="Recommendations"
              items={recommendations}
              emptyText="No specific recommendations provided."
              color={sectionTypes.recommendations}
            />
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="px-10 py-8 border-t border-gray-400">
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <motion.button
              onClick={() => exportResultDetailToPDF(resultData, `test_result_${resultData.user_lastname}`)}
              className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDownTrayIcon className="w-6 h-6" />
              <span className="text-lg">Download PDF Report</span>
            </motion.button>

            <motion.button
              onClick={onClose}
              className="px-10 py-4 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">Close Results</span>
            </motion.button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TestResultModal;