import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronLeft, ChevronRight, BookOpenCheck } from "lucide-react";
import { API_URL } from "../../../config";
import LoadingSpinner from "../../Components/ui/LoadingSpinner";
import AICommentRenderer from '../Test/AICommentRenderer';

const DropdownAnimation = {
  hidden: {
    opacity: 0,
    height: 0,
    marginTop: 0,
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  visible: {
    opacity: 1,
    height: "auto",
    marginTop: "0.75rem",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
      when: "beforeChildren"
    }
  }
};



const ChevronAnimation = {
  rotate: {
    rotate: 180,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  initial: {
    rotate: 0,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
};


// Función para ocultar el warning si existe
const hideWarning = () => {
  try {
    const warningElement = document.querySelector("df-messenger > df-messenger-chat-bubble")
      ?.shadowRoot?.querySelector("#df-chat-wrapper")
      ?.shadowRoot?.querySelector("div > df-messenger-user-input")
      ?.shadowRoot?.querySelector("div > div.popout-wrapper.show.warning-wrapper");

  
    warningElement.style.display = 'none';
    return true;
    
  } catch (error) {
    console.error('Error hiding warning:', error);
  }
  return false;
};




const prepareForChat = (question, title) => {
  const correctAnswerText = question.correct_answer?.text || '';
  const titleTest = title?.title_test || '';

  const chatContent = `Question: "${question.question_text}"\n` +
    `Student Answer: "${question.student_answer?.text || 'No answer'}"\n` +
    `Correct Answer: "${correctAnswerText}"\n` +
    `Context: "${titleTest}"`;

  copyToChatInput(chatContent);
};

const copyToChatInput = (content) => {
  try {
    // Primero intentamos abrir el chat si no está visible
    const chatBubble = document.querySelector("df-messenger > df-messenger-chat-bubble");
    if (chatBubble) {
      const chatButton = chatBubble.shadowRoot.querySelector("div > button");
      const btn_opened_closed = chatButton.getAttribute('aria-expanded');
      if (chatButton) {
        if (btn_opened_closed == 'false') {
          // Abre el chat (simula clic en el botón del chat)
          chatButton.click();
        }

        // Esperamos un breve momento para que el chat se abra antes de insertar el texto
        setTimeout(() => {
          try {
            // Ahora intentamos encontrar el textarea dentro del chat abierto
            const textarea = document.querySelector("df-messenger > df-messenger-chat-bubble").shadowRoot.querySelector("#df-chat-wrapper").shadowRoot.querySelector("div > df-messenger-user-input").shadowRoot.querySelector("div > div.input-box-wrapper > div.input-wrapper > div > div > textarea");

            if (textarea) {
              textarea.value = typeof content === 'string' ? content :
                `Question: "${content.question_text}"\n` +
                `Student Answer: "${content.student_answer?.text || 'No answer'}"\n` +
                `Correct Answer: "${content.correct_answer?.text || ''}"\n` +
                `Context: "${content.title?.title_test || ''}"`;

              // Dispara el evento input para que el chat detecte el cambio
              const event = new Event('input', { bubbles: true });
              textarea.dispatchEvent(event);

              // Enfoca el textarea
              textarea.focus();

              // Ahora buscamos y hacemos clic en el botón de enviar
              setTimeout(() => {
                try {
                  const sendButton = document.querySelector("df-messenger > df-messenger-chat-bubble").shadowRoot.querySelector("#df-chat-wrapper").shadowRoot.querySelector("div > df-messenger-user-input").shadowRoot.querySelector("#send-icon-button");
                  if (sendButton) {
                    sendButton.click();
                  }
                } catch (sendError) {
                  console.error('Error clicking send button:', sendError);
                }
              }, 200); // Pequeño delay para asegurar que el texto se ha establecido
              
              return;
            }
          } catch (innerError) {
            console.error('Error accessing chat input:', innerError);
          }
        }, 300); // Pequeño delay para asegurar que el chat se ha abierto
      }
      hideWarning();
    }
  } catch (error) {
    console.error('Error accessing chat:', error);
  }
};


const ViewExamDetails = ({ initialExamDetails, scrollRef, userRole }) => {
  const [examDetails, setExamDetails] = useState(initialExamDetails);
  const [expandedComments, setExpandedComments] = useState({});
  const [loadingComments, setLoadingComments] = useState({});
  const [error, setError] = useState(null);
  const [remainingRequests, setRemainingRequests] = useState(5);
  const [stats, setStats] = useState({ answered: 0, correct: 0, total: 0 });
  const [currentIncorrectIndex, setCurrentIncorrectIndex] = useState(-1);
  const incorrectQuestionsRef = useRef([]);

  const checkRemainingRequests = useCallback(async () => {
    if (userRole === 'admin' || userRole === 'teacher') return;

    try {
      const response = await fetch(`${API_URL}/check-ai-requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRemainingRequests(data.remaining_requests === 'unlimited' ? Infinity : data.remaining_requests);
      }
    } catch (err) {
      console.error('Error checking remaining requests:', err);
    }
  }, [userRole]);

  useEffect(() => {
    checkRemainingRequests();
  }, [checkRemainingRequests]);

  const toggleComment = useCallback((questionId) => {
    setExpandedComments(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  }, []);

  const fetchAIComment = useCallback(async (testdetailId, questionText, studentAnswer, correctAnswer, titleTest) => {
    try {
      setLoadingComments(prev => ({ ...prev, [testdetailId]: true }));
      setError(null);

      const response = await fetch(`${API_URL}/generate-ai-comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          testdetail_id: testdetailId,
          question_text: questionText,
          student_answer: studentAnswer,
          correct_answer: correctAnswer,
          title_test: titleTest.length > 2000 ? `${titleTest.substring(0, 2000)}...` : titleTest
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setRemainingRequests(0);
          throw new Error(data.error || 'Daily limit reached');
        }
        throw new Error(data.error || 'Error getting analysis');
      }

      setExamDetails(prevDetails => prevDetails.map(section => ({
        ...section,
        titles: section.titles.map(title => ({
          ...title,
          questions: title.questions.map(question =>
            question.testdetail_id === testdetailId
              ? { ...question, ai_comments: data.analysis }
              : question
          )
        }))
      })));

      setExpandedComments(prev => ({ ...prev, [testdetailId]: true }));

      if (data.remaining_requests !== undefined) {
        setRemainingRequests(data.remaining_requests);
      }

      return data.analysis;
    } catch (err) {
      console.error('Error fetching AI comment:', err);
      setError(err.message);
      return null;
    } finally {
      setLoadingComments(prev => ({ ...prev, [testdetailId]: false }));
    }
  }, []);

  const parsedExamDetails = useMemo(() => {
    if (!initialExamDetails) return null;

    let answeredQuestions = 0;
    let correctAnswers = 0;
    let totalQuestions = 0;
    incorrectQuestionsRef.current = [];

    const processedData = initialExamDetails.map(section => {
      const filteredTitles = section.titles.map(title => {
        const filteredQuestions = title.questions.filter(question => {
          totalQuestions++;
          const hasAnswer = !!question.student_answer?.option_id;
          const isCorrect = hasAnswer &&
            question.student_answer?.option_id === question.correct_answer?.option_id;

          if (hasAnswer) answeredQuestions++;
          if (isCorrect) correctAnswers++;

          // (userRole === 'admin' || userRole === 'teacher') && hasAnswer && !isCorrect ----FORMA ANTERIOR POR ROL
          if (hasAnswer && !isCorrect) {
            incorrectQuestionsRef.current.push({
              id: question.testdetail_id,
              section: section.section_desc,
              questionText: question.question_text
            });
          }

          return userRole === 'admin' || userRole === 'teacher' || hasAnswer;
        });

        if (userRole === 'student' && filteredQuestions.length === 0) {
          return null;
        }

        return {
          ...title,
          questions: filteredQuestions.map(question => {
            try {
              return {
                ...question,
                ai_comments: question.ai_comments ? JSON.parse(question.ai_comments) : null,
                //   isIncorrect: (userRole === 'admin' || userRole === 'teacher') &&
                //     !!question.student_answer?.option_id &&
                //     question.student_answer?.option_id !== question.correct_answer?.option_id
                // 
                isIncorrect: !!question.student_answer?.option_id &&
                  question.student_answer?.option_id !== question.correct_answer?.option_id

              };
            } catch (e) {
              console.error('Error parsing AI comments:', e);
              return { ...question, ai_comments: null };
            }
          })
        };
      }).filter(Boolean);

      return {
        ...section,
        titles: filteredTitles
      };
    });

    // Actualizar el índice actual si hay preguntas incorrectas
    if (incorrectQuestionsRef.current.length > 0) {
      setCurrentIncorrectIndex(0);
    } else {
      setCurrentIncorrectIndex(-1);
    }

    setStats({
      answered: answeredQuestions,
      correct: correctAnswers,
      total: totalQuestions
    });

    localStorage.setItem('examStats', JSON.stringify({
      answered: answeredQuestions,
      correct: correctAnswers,
      total: totalQuestions
    }));

    return processedData;
  }, [initialExamDetails, userRole]);

  useEffect(() => {
    if (parsedExamDetails) {
      setExamDetails(parsedExamDetails);
    }
  }, [parsedExamDetails]);

  const scrollToQuestion = (questionId) => {
    const element = document.getElementById(`question-${questionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('animate-pulse', 'bg-red-100');
      setTimeout(() => {
        element.classList.remove('animate-pulse', 'bg-red-100');
      }, 2000);
    }
  };

  const handleNextIncorrect = () => {
    if (incorrectQuestionsRef.current.length === 0) return;
    const nextIndex = (currentIncorrectIndex + 1) % incorrectQuestionsRef.current.length;
    setCurrentIncorrectIndex(nextIndex);
    scrollToQuestion(incorrectQuestionsRef.current[nextIndex].id);
  };

  const handlePrevIncorrect = () => {
    if (incorrectQuestionsRef.current.length === 0) return;
    const prevIndex = (currentIncorrectIndex - 1 + incorrectQuestionsRef.current.length) % incorrectQuestionsRef.current.length;
    setCurrentIncorrectIndex(prevIndex);
    scrollToQuestion(incorrectQuestionsRef.current[prevIndex].id);
  };

  const renderAICommentSection = useCallback((question, title) => {
    if (!title) {
      console.error("Title is undefined for question:", question);
      return null;
    }

    const correctAnswerText = question.correct_answer?.text || '';
    const titleTest = title?.title_test || '';
    const hasStudentAnswer = !!question.student_answer?.text;
    const questionId = question.testdetail_id;

    if (question.ai_comments) {
      return (
        <div className="flex flex-col space-y-2">
          <div>
            <motion.button
              onClick={() => toggleComment(questionId)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center focus:outline-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {expandedComments[questionId] ? 'Hide analysis' : 'View AI analysis'}
              <motion.svg
                className="ml-1 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                animate={expandedComments[questionId] ? "rotate" : "initial"}
                variants={ChevronAnimation}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </motion.svg>
            </motion.button>

            <AnimatePresence>
              {expandedComments[questionId] && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={DropdownAnimation}
                  className="overflow-hidden"
                >
                  <AICommentRenderer comment={question.ai_comments} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={() => prepareForChat(question, title)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium focus:outline-none text-left"
          >
            Ask Your AI Mentor
          </button>

        </div>
      );
    }

    if (!hasStudentAnswer) {
      return <p className="text-sm text-gray-500 italic">No answer selected to analyze</p>;
    }

    if (remainingRequests <= 0) {
      return <p className="text-sm text-orange-600">Daily limit reached (300 analyses per day)</p>;
    }

    return (
      <div className="flex flex-col space-y-2">
        <button
          onClick={() => fetchAIComment(questionId, question.question_text, question.student_answer?.text, correctAnswerText, titleTest)}
          disabled={loadingComments[questionId]}
          className={`text-sm ${loadingComments[questionId]
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-sm text-blue-600 hover:text-blue-800'}  font-medium flex items-center focus:outline-none`}
          title={`You have ${remainingRequests} analyses left today`}
        >
          {loadingComments[questionId] ? (
            <LoadingSpinner text="Generating analysis..." />
          ) : (
            'Analyze with AI'
          )}
        </button>
        <button
          onClick={() => prepareForChat(question, title)}
          disabled={loadingComments[questionId]}
          className={`text-sm ${loadingComments[questionId]
            ? 'text-gray-500 cursor-not-allowed'
            : 'text-purple-600 hover:text-purple-800'} font-medium focus:outline-none text-left`}
        >
          Ask Your AI Mentor
        </button>
      </div>
    );
  }, [expandedComments, fetchAIComment, loadingComments, remainingRequests, toggleComment]);

  const renderQuestions = useCallback((title, titleIndex, sectionIndex) => {
    return title.questions.map((question, questionIndex) => {
      const hasAnswer = !!question.student_answer?.option_id;
      const isCorrect = hasAnswer &&
        question.student_answer?.option_id === question.correct_answer?.option_id;
      const isIncorrect = question.isIncorrect;

      return (
        <div
          id={`question-${question.testdetail_id}`}
          key={`${question.question_id}-${questionIndex}`}
          className={`bg-white p-4 mb-4 rounded-xl shadow-sm border-2 relative ${isIncorrect
            ? 'border-red-500 hover:border-red-600'
            : 'border-gray-200 hover:border-gray-300'
            } hover:shadow-md transition-all`}
        >
          {isIncorrect && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}

          <p className="font-semibold text-gray-800 mb-2">
            {sectionIndex + 1}.{titleIndex + 1}.{questionIndex + 1} {question.question_text}
          </p>

          <ul className="list-disc pl-5 space-y-1 mb-3">
            {question.options.map((option) => {
              const isStudent = question.student_answer?.option_id === option.option_id;
              const isCorrectOption = question.correct_answer?.option_id === option.option_id;

              return (
                <li
                  key={option.option_id}
                  className={`
                    ${isStudent ? "text-blue-600 font-medium" : ""}
                    ${userRole !== 'student' && isCorrectOption ? "text-green-600 font-medium" : ""}
                  `}
                >
                  {option.text}
                  {isStudent && (
                    <span className="ml-2 text-blue-600">
                      {userRole === 'admin' || userRole === 'teacher' ? "(Student's answer)" : "(Your answer)"}
                    </span>
                  )}
                  {userRole !== 'student' && isCorrectOption && !isStudent && (
                    <span className="ml-2 text-green-600">(Correct answer)</span>
                  )}
                  {userRole !== 'student' && isCorrectOption && isStudent && (
                    <span className="ml-2 text-green-600">(Correct)</span>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-3 border-t border-gray-400 pt-3">
            {renderAICommentSection(question, title)}
          </div>
        </div>
      );
    });
  }, [renderAICommentSection, userRole]);

  const renderTitles = useCallback((section, sectionIndex) => {
    return section.titles.map((title, titleIndex) => (
      <div key={`${title.title_id}-${titleIndex}`} className="mb-6">
        <div className="font-semibold text-md mb-3 text-gray-700">
          {title.title_type === "LISTENING" ? (
            title.title_url ? (
              <>
                <hr className="my-4 border-gray-300" />
                <h5 className="text-lg font-semibold text-gray-800 mb-2">{title.title_name}</h5>
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
                        const message = parts.slice(1).join(':').trim();
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
        {renderQuestions(title, titleIndex, sectionIndex)}
      </div>
    ));
  }, [renderQuestions, userRole]);

  if (!examDetails) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-600">Loading exam details...</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={scrollRef}
      className="border-r border-gray-200 overflow-y-auto max-h-[91vh] relative"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-400 flex justify-between items-center">

        <div className="flex items-center justify-center gap-2">
          <BookOpenCheck className="w-6 h-6 text-gray-800" />
          <h3 className="text-xl font-semibold text-gray-800">Details</h3>
        </div>

        {/* (userRole === 'admin' || userRole === 'teacher') && incorrectQuestionsRef.current.length > 0 &&*/}
        {incorrectQuestionsRef.current.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevIncorrect}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center bg-red-50 px-3 py-1 rounded-full">
              <AlertCircle className="w-4 h-4 text-red-600 mr-1" />
              <span className="text-sm font-medium">
                {currentIncorrectIndex + 1}/{incorrectQuestionsRef.current.length}
              </span>
            </div>
            <button
              onClick={handleNextIncorrect}
              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {error.includes('Daily limit') ? (
            <div>
              <p>{error}</p>
              <p className="mt-2">You can only perform 5 analyses per day. Try again tomorrow.</p>
            </div>
          ) : (
            error
          )}
        </div>
      )}

      {userRole !== 'admin' && userRole !== 'teacher' && (
        <div className="mx-4 mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
          Analyses available today: <span className="font-bold">{remainingRequests}</span>
        </div>
      )}

      <div className="p-4 space-y-6">
        {examDetails?.map((section, sectionIndex) => (
          <motion.div
            key={`${section.section_type}-${sectionIndex}`}
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
            {renderTitles(section, sectionIndex)}
          </motion.div>
        ))}
      </div>

      <df-messenger
        location="us-east1"
        project-id="necdiagnostics-tesis"
        agent-id="74180c1b-a688-4176-a28d-a82b260e5c7e"
        language-code="es"
        max-query-length="2500">
        <df-messenger-chat-bubble chat-title="NECBot">
        </df-messenger-chat-bubble>
      </df-messenger>

    </motion.div>
  );
};

export default React.memo(ViewExamDetails);