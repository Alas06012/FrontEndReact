// components/Modal/ExamSection.jsx
import React from "react";
import { motion } from "framer-motion";

const ViewExamDetails = ({ examDetails, scrollRef, userRole }) => (
  <motion.div
    ref={scrollRef}
    className="border-r border-gray-200 overflow-y-auto max-h-[90vh]"
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 20 }}
    transition={{ duration: 0.4 }}
  >
    <h3 className="text-lg font-semibold mb-4 text-gray-800 top-0 py-2 z-10">
      Exam Details
    </h3>

    {examDetails ? (
      <div className="space-y-6">
        {examDetails.map((section, sectionIndex) => (
          <motion.div
            key={section.section_type}
            className={`p-4 rounded-xl shadow-md ${section.section_type === "READING"
              ? "bg-blue-50 border-l-4 border-blue-500"
              : "bg-green-50 border-l-4 border-green-500"
              }`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: sectionIndex * 0.1 }}
          >
            <h4 className="font-bold text-lg mb-4 text-gray-900">
              {section.section_desc} ({section.section_type})
            </h4>
            {section.titles.map((title, titleIndex) => (
              <div key={title.title_id} className="mb-6">
                <div className="font-semibold text-md mb-3 text-gray-700">

                  {title.title_type === "LISTENING" ? (
                    title.title_url ? (
                      <>
                        <hr className="my-4 border-gray-300" />
                        <h5 className="text-lg font-semibold text-gray-800 mb-2">
                          {title.title_name}
                        </h5>
                        <audio
                          controls
                          className="w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <source src={title.title_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>

                        {(userRole === 'admin' || userRole === 'teacher') && (
                          <div className="mt-4 p-4 bg-gray-50 border-l-4 border-gray-400 rounded-md shadow-sm space-y-2 text-gray-700">
                            {title.title_test
                              .split('\n')
                              .filter(line => line.trim() !== '')
                              .map((line, index) => {
                                const parts = line.split(':');
                                const speaker = parts[0]?.trim();
                                const message = parts.slice(1).join(':').trim(); // Por si el texto tiene más de un ":" 
                                return (
                                  <div key={index}>
                                    <span className="font-semibold text-gray-800">{speaker}:</span>{' '}
                                    <span>{message}</span>
                                  </div>
                                );
                              })}
                          </div>
                        )}

                      </>

                    ) : (
                      <p className="text-red-500">Audio not available</p>
                    )
                  ) : (
                    <>
                      <hr className="my-4 border-gray-300" />

                      <h5 className="text-lg font-semibold text-gray-800 mb-2">{title.title_name}</h5>
                      <div className="mt-4 p-4 bg-gray-50 border-l-4 border-gray-400 rounded-md shadow-sm space-y-2 text-gray-700">
                        {title.title_test}
                      </div>
                    </>
                  )}
                </div>
                {title.questions.map((question, questionIndex) => (
                  <div
                    key={question.question_id}
                    className="bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition duration-200"
                  >
                    <p className="font-semibold text-gray-800 mb-2">
                      {sectionIndex + 1}.{titleIndex + 1}.{questionIndex + 1}{" "}
                      {question.question_text}
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      {question.options.map((option) => {
                        const isStudent =
                          question.student_answer?.option_id === option.option_id;
                        const isCorrect =
                          question.correct_answer?.option_id === option.option_id;

                        return (
                          <li
                            key={option.option_id}
                            className={`text-gray-700 ${isStudent ? "text-blue-600 font-medium" : ""
                              } ${isCorrect ? "text-green-600 font-medium" : ""}`}
                          >
                            {option.text}
                            {isStudent && (
                              <span className="ml-2 text-blue-600">(Student's Answer)</span>
                            )}
                            {isCorrect && (
                              <span className="ml-2 text-green-600">(Correct Answer)</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    ) : (
      <p className="text-gray-600">Loading exam details...</p>
    )}
  </motion.div>
);

export default ViewExamDetails;
