import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Alert from "../../../Components/Alert.jsx";
import { API_URL } from "../../../../config.js";
import { getUserRole } from "../../../Utils/auth.js";
import { Plus } from "lucide-react";
import Table from "../../../Components/Table.jsx";
import Modal from "../../../Components/Modal.jsx";
import Pagination from "../../../Components/Pagination.jsx";
import TestFormModal from "../../../Components/TestFormModal.jsx";
import TestResultModal from "../../../Components/Test/TestResultModal.jsx";
import { Eye, MessageCircle, MessageSquarePlus, RotateCcw, BarChart2, Edit2 } from "lucide-react";
import Form from "../../../Components/Form.jsx";

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [testStarted, setTestStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [filters, setFilters] = useState({
    user_email: "",
    user_name: "",
    user_lastname: "",
    level_name: "",
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [comments, setComments] = useState([]);

  const navigate = useNavigate();
  const userRole = getUserRole()?.toLowerCase();

  useEffect(() => {
    if (!userRole || (userRole !== "admin" && userRole !== "teacher")) {
      Alert({
        title: "Access Denied",
        text: "You need admin or teacher privileges to access this page.",
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
      navigate("/dashboard/" + userRole);
    } else {
      fetchTests();
    }
  }, [userRole, navigate]);

  useEffect(() => {
    if (timeLeft === 0 && testStarted) {
      Alert({
        title: "Time's up!",
        text: "The test has been automatically submitted.",
        icon: "info",
        background: "#1e293b",
        color: "white",
      });
      handleTestSubmit({ detalles: [] });
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, testStarted]);

  const handleFilterChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchTests = async (page = 1, per_page = perPage) => {
    setLoading(true);
    try {
      const body = {
        page,
        per_page,
        ...filters,
      };

      const response = await fetch(`${API_URL}/all-tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const testsWithComments = await Promise.all(data.tests.map(async (test) => {
          const commentResponse = await fetch(`${API_URL}/test-comments-per-id`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({ test_id: test.pk_test }),
          });
          const commentData = await commentResponse.json();
          return { ...test, hasComments: commentData.data.length > 0 };
        }));
        setTests(testsWithComments);
        setPagination(data.pagination);
      } else {
        const err = await response.json();
        Alert({
          title: "Error",
          text: err.error || "Failed to fetch tests",
          icon: "error",
          background: "#4b7af0",
          color: "white",
        });
      }
    } catch {
      Alert({
        title: "Error",
        text: "Network error",
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => fetchTests(1, perPage);

  const createTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/newtest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert({
          title: "Error",
          text: err.message || "Failed to create test",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
        return;
      }

      const res = await response.json();
      Alert({
        title: "Success",
        text: res.message || "Test created successfully",
        icon: "success",
        background: "#1e293b",
        color: "white",
      });

      fetchTests();

      if (res?.data?.detalles?.length > 0 && res.data.test_id) {
        await fetchTestData(res.data.test_id);
        setTestStarted(true);
      }
    } catch (err) {
      Alert({
        title: "Error",
        text: "Network error",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestData = async (testId) => {
    try {
      const response = await fetch(`${API_URL}/test-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ test_id: testId }),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert({
          title: "Error",
          text: err.message || "Error loading test details",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
        return;
      }

      const data = await response.json();
      if (data?.sections?.length > 0) {
        setDetailsData(data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      Alert({
        title: "Error",
        text: "Failed to fetch test data",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const handleTestSubmit = async (responses) => {
    const unanswered = responses.detalles?.filter((d) => !d.selected_option);
    if (unanswered.length > 0) {
      Alert({
        title: "Incomplete Test",
        text: `You have ${unanswered.length} unanswered question(s). Please complete all questions before submitting.`,
        icon: "warning",
        background: "#f97316",
        color: "white",
      });
      return;
    }

    const confirm1 = window.confirm("Are you sure you want to submit the test?");
    if (!confirm1) return;

    const confirm2 = window.confirm(
      "This is your final confirmation. Do you really want to finish?"
    );
    if (!confirm2) return;

    try {
      const payload = {
        test_id: detailsData.test_id,
        detalles: responses.detalles,
      };

      const response = await fetch(`${API_URL}/finish-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert({
          title: "Error",
          text: err.message || "Failed to submit test",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
        return;
      }

      const result = await response.json();
      Alert({
        title: "Success",
        text: result.message || "Test submitted successfully!",
        icon: "success",
        background: "#1e293b",
        color: "white",
      });

      fetchTests();
      setShowDetailsModal(false);
      setTestStarted(false);
    } catch (error) {
      Alert({
        title: "Error",
        text: "Submission failed",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const handleViewResult = async (testId) => {
    try {
      const response = await fetch(`${API_URL}/test-analysis`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ test_id: testId }),
      });

      if (!response.ok) {
        const err = await response.json();
        return Alert({
          title: "Error",
          text: err.message || "No se pudo cargar el resultado",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }

      const data = await response.json();
      setResultData(data);
      setShowResultModal(true);
    } catch (error) {
      Alert({
        title: "Error",
        text: "Error de red al cargar resultados",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const handleAddComment = async (data) => {
    try {
      const response = await fetch(`${API_URL}/test-comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          test_id: selectedTestId,
          comment_title: data.comment_title,
          comment_value: data.comment_value,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert({
          title: "Success",
          text: data.message,
          icon: "success",
          background: "#1e293b",
          color: "white",
        });
        setShowCommentModal(false);
        setIsAddingComment(false);
        setSelectedTestId(null);
        setSelectedComment(null);
        fetchTests();
      } else {
        const errorData = await response.json();
        Alert({
          title: "Error",
          text: errorData.message || "Failed to add comment",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }
    } catch (error) {
      Alert({
        title: "Error",
        text: "A network error occurred",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const handleUpdateComment = async (data) => {
    try {
      const response = await fetch(`${API_URL}/test-comments`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          comment_id: selectedComment.pk_comment,
          comment_title: data.comment_title,
          comment_value: data.comment_value,
        }),
      });

      if (response.ok) {
        const updatedData = await response.json();
        Alert({
          title: "Success",
          text: updatedData.message,
          icon: "success",
          background: "#1e293b",
          color: "white",
        });
        // Actualiza el comentario en la lista sin cerrar la modal
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.pk_comment === selectedComment.pk_comment
              ? { ...comment, comment_title: data.comment_title, comment_value: data.comment_value }
              : comment
          )
        );
        setSelectedComment(null); // Limpia el comentario seleccionado después de editar
      } else {
        const errorData = await response.json();
        Alert({
          title: "Error",
          text: errorData.message || "Failed to update comment",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }
    } catch (error) {
      Alert({
        title: "Error",
        text: "A network error occurred",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const handleViewOrUpdateComments = async (testId) => {
    try {
      const response = await fetch(`${API_URL}/test-comments-per-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ test_id: testId }),
      });

      if (!response.ok) {
        const err = await response.json();
        return Alert({
          title: "Error",
          text: err.message || "Failed to load comments",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }

      const data = await response.json();
      setComments(data.data);
      setSelectedTestId(testId);
      setShowCommentModal(true);
      setIsAddingComment(false);
    } catch (err) {
      Alert({
        title: "Error",
        text: "Network error",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const handleAddCommentClick = (testId) => {
    setSelectedTestId(testId);
    setShowCommentModal(true);
    setIsAddingComment(true);
    setComments([]);
    setSelectedComment(null);
  };

  const handleRetryTest = async (testId) => {
    const confirmRetry = window.confirm(
      "Do you want to retry this test? This will count as a new attempt."
    );
    if (!confirmRetry) return;

    try {
      const response = await fetch(`${API_URL}/retry-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ test_id: testId }),
      });

      if (!response.ok) {
        const err = await response.json();
        return Alert({
          title: "Error",
          text: err.message || "No se pudo reiniciar el test",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }

      const result = await response.json();
      Alert({
        title: "Test restarted",
        text: result.message || "You have started a new test attempt.",
        icon: "success",
        background: "#1e293b",
        color: "white",
      });

      if (result?.data?.test_id) {
        await fetchTestData(result.data.test_id);
        setTestStarted(true);
      }
    } catch (error) {
      Alert({
        title: "Error",
        text: "Network error",
        icon: "error",
        background: "#1e293b",
        color: "white",
      });
    }
  };

  const changePage = (page) => fetchTests(page, perPage);

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchTests(1, newPerPage);
  };

  const tableColumns = [
    { header: "ID Test", key: "pk_test" },
    { header: "Email", key: "user_email" },
    { header: "Name", key: "user_name" },
    { header: "Lastname", key: "user_lastname" },
    { header: "Level", key: "level_name" },
    { header: "Status", key: "status" },
    {
      header: "Passed",
      key: "test_passed",
      render: (row) => (row.test_passed === 1 ? "Aprobado" : "Reprobado"),
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (row.status === "COMPLETED") {
                handleViewResult(row.pk_test);
              }
            }}
            className={`text-purple-600 hover:text-purple-800 ${
              row.status === "COMPLETED" ? "cursor-pointer" : "text-gray-400 cursor-not-allowed"
            }`}
            title={row.status === "COMPLETED" ? "View test result" : "Result not available"}
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          {!row.hasComments ? (
            <button
              onClick={() => handleAddCommentClick(row.pk_test)}
              className="text-green-600 hover:text-green-800 cursor-pointer"
              title="Add Comment"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => handleViewOrUpdateComments(row.pk_test)}
                className="text-green-600 hover:text-green-800 cursor-pointer"
                title="View Comments"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleAddCommentClick(row.pk_test)}
                className="text-green-600 hover:text-green-800 cursor-pointer"
                title="Add Comment"
              >
                <MessageSquarePlus className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => {
              if (row.status !== "COMPLETED") {
                handleRetryTest(row.pk_test);
              }
            }}
            className={`text-red-600 hover:text-red-800 ${
              row.status !== "COMPLETED" ? "cursor-pointer" : "text-gray-400 cursor-not-allowed"
            }`}
            title={row.status !== "COMPLETED" ? "Retry test" : "Cannot retry completed test"}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const commentFields = [
    { name: "comment_title", label: "Title (Optional)", type: "text" },
    { name: "comment_value", label: "Comment", type: "textarea", validation: { required: "Comment is required" } },
  ];

  const commentFormFields = comments.length > 0 || isAddingComment
    ? commentFields
    : commentFields;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 tracking-tight">
          Test Management
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <input
            type="text"
            name="user_email"
            placeholder="Email"
            value={filters.user_email}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="user_name"
            placeholder="First Name"
            value={filters.user_name}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="user_lastname"
            placeholder="Last Name"
            value={filters.user_lastname}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="level_name"
            value={filters.level_name}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Levels</option>
            {["A1", "A2", "B1", "B2", "C1", "C2"].map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl shadow transition"
          >
            Apply Filters
          </button>

          <button
            onClick={() => setShowInstructions(true)}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-xl shadow transition"
          >
            <Plus className="w-5 h-5" />
            Create Test
          </button>
        </div>

        {/* Table */}
        <Table
          columns={tableColumns}
          data={tests}
          loading={loading}
          actionTitle=""
          className="rounded-md shadow-md overflow-hidden"
        />

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={changePage}
          />
          <select
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={perPage}
            onChange={handlePerPageChange}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>

        {/* Modal for Test Form */}
        <TestFormModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          testData={detailsData}
          onSubmit={handleTestSubmit}
          initialTime={7200} // 1 hour
          testStarted={true}
        />

        {/* Modal for Instructions */}
        {showInstructions && (
          <Modal
            isOpen={showInstructions}
            onClose={() => setShowInstructions(false)}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                TOEIC Test Instructions / Instrucciones TOEIC
              </h2>

              <div className="w-full flex justify-end mb-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="lang-toggle"
                    checked={filters.language === "es"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        language: e.target.checked ? "es" : "en",
                      }))
                    }
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor="lang-toggle"
                    className="select-none text-gray-700"
                  >
                    {filters.language === "es" ? "Español" : "English"}
                  </label>
                </div>
              </div>

              {filters.language === "es" ? (
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li>
                    El examen TOEIC Online Listening and Reading dura 2 horas (120
                    minutos): 50 preguntas de Listening y 50 de Reading.
                  </li>
                  <li>
                    Responde cuidadosamente las 100 preguntas de opción múltiple.
                  </li>
                  <li>
                    Es indispensable tener una conexión estable a internet durante
                    todo el examen.
                  </li>
                  <li>
                    Usa un ambiente silencioso y sin distracciones para asegurar
                    tu concentración.
                  </li>
                  <li>
                    Una vez enviado el examen, no podrás modificar tus respuestas.
                  </li>
                  <li>
                    No está permitido usar ayudas o dispositivos no autorizados
                    durante el examen.
                  </li>
                  <li>
                    Es importante contestar todas las preguntas, de lo contrario
                    no obtendrás un buen resultado.
                  </li>
                  <li>
                    Solo dispones de tres (3) intentos por día para realizar el
                    examen.
                  </li>
                  <li>
                    Si cierras el examen antes de completarlo, se consumirá un
                    intento y tus respuestas no serán enviadas ni evaluadas.
                  </li>
                </ul>
              ) : (
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li>
                    The TOEIC Online Listening and Reading test lasts 2 hours (120
                    minutes): 50 Listening questions and 50 Reading questions.
                  </li>
                  <li>Carefully answer all 100 multiple-choice questions.</li>
                  <li>
                    A stable internet connection throughout the test is essential.
                  </li>
                  <li>
                    Use a quiet environment free of distractions to ensure focus.
                  </li>
                  <li>
                    Once the test is submitted, you cannot change your answers.
                  </li>
                  <li>
                    No unauthorized aids or devices are allowed during the exam.
                  </li>
                  <li>
                    It is important to answer all questions; otherwise, you will
                    not achieve a good result.
                  </li>
                  <li>You are allowed only three (3) test attempts per day.</li>
                  <li>
                    If you close the test without completing it, one attempt will
                    be consumed and your answers will not be submitted or
                    evaluated.
                  </li>
                </ul>
              )}

              <div className="mt-6 flex justify-end gap-4">
                <button
                  onClick={() => setShowInstructions(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-xl"
                >
                  {filters.language === "es" ? "Cancelar" : "Cancel"}
                </button>
                <button
                  onClick={() => {
                    setShowInstructions(false);
                    createTest();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-xl"
                >
                  {filters.language === "es" ? "Continuar" : "Continue"}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal for Test Result */}
        <TestResultModal
          isOpen={showResultModal}
          onClose={() => setShowResultModal(false)}
          resultData={resultData}
        />

        {/* Modal for Comments */}
        <Modal
          isOpen={showCommentModal}
          onClose={() => {
            setShowCommentModal(false);
            setIsAddingComment(false);
            setSelectedTestId(null);
            setSelectedComment(null);
          }}
          title={isAddingComment ? `Add Comment to Test #${selectedTestId}` : `View/Edit Comments for Test #${selectedTestId}`}
        >
          {isAddingComment ? (
            <Form
              fields={commentFields}
              onSubmit={handleAddComment}
              onCancel={() => {
                setShowCommentModal(false);
                setIsAddingComment(false);
                setSelectedTestId(null);
              }}
              submitText="Save Comment"
              layout="grid-cols-1"
            />
          ) : comments.length > 0 ? (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Existing Comments</h3>
              <ul className="list-disc pl-5 mb-4">
                {comments.map((comment) => (
                  <li key={comment.pk_comment} className="mb-2">
                    <strong>{comment.comment_title || "No title"}</strong>: {comment.comment_value} (by {comment.author}, {new Date(comment.created_at).toLocaleString()})
                    <button
                      onClick={() => setSelectedComment(comment)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 className="w-4 h-4 inline" /> Edit
                    </button>
                  </li>
                ))}
              </ul>
              {selectedComment && (
                <Form
                  fields={commentFields}
                  initialData={{
                    comment_title: selectedComment.comment_title,
                    comment_value: selectedComment.comment_value,
                  }}
                  onSubmit={handleUpdateComment}
                  onCancel={() => setSelectedComment(null)}
                  submitText="Update Comment"
                  layout="grid-cols-1"
                />
              )}
            </div>
          ) : (
            <p className="p-4 text-gray-600">No comments available.</p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Tests;