import React, { useState, useEffect, useRef } from "react";
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
import {
  Eye,
  MessageCircle,
  MessageSquarePlus,
  RotateCcw,
  BarChart2,
  Edit2,
} from "lucide-react";
import Form from "../../../Components/Form.jsx";
import ViewExamComments from "../../../Components/Test/ViewExamComments.jsx";
import ViewExamDetails from "../../../Components/Test/ViewExamDetails.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";

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
  const [showExamModal, setShowExamModal] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showEditCommentModal, setShowEditCommentModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [comments, setComments] = useState([]);
  const [examDetails, setExamDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userRole = getUserRole()?.toLowerCase();

  // Comportamiento en telefono de apartado de ver detalles de examen y comentarios
  // ---------------------------------------------------------------------------
  const [showMobileComments, setShowMobileComments] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const detailsScrollRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  // Detectar cambios en tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOpenMobileComments = () => {
    if (detailsScrollRef.current) {
      setScrollY(detailsScrollRef.current.scrollTop);
    }
    setShowMobileComments(true);
  };

  const handleCloseMobileComments = () => {
    setShowMobileComments(false);
    setTimeout(() => {
      if (detailsScrollRef.current) {
        detailsScrollRef.current.scrollTop = scrollY;
      }
    }, 50);
  };

  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!userRole || (userRole !== "admin" && userRole !== "teacher" && userRole !== "student")) {
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
        const testsWithComments = await Promise.all(
          data.tests.map(async (test) => {
            const commentResponse = await fetch(
              `${API_URL}/test-comments-per-id`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${localStorage.getItem(
                    "access_token"
                  )}`,
                },
                body: JSON.stringify({ test_id: test.pk_test }),
              }
            );
            const commentData = await commentResponse.json();
            return { ...test, hasComments: commentData.data.length > 0 };
          })
        );
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
    const unanswered =
      responses.detalles?.filter((d) => !d.user_answer_id) || [];
    const hasUnanswered = unanswered.length > 0;

    // Primera confirmación si hay preguntas sin responder
    const userConfirmation = await Alert({
      title: hasUnanswered ? "Incomplete Test" : "Submit Test?",
      text: hasUnanswered
        ? `You have ${unanswered.length} unanswered question(s). Do you still want to submit the test?`
        : "Are you sure you want to submit the test now?",
      icon: hasUnanswered ? "warning" : "question",
      type: "confirm",
      confirmButtonText: "Yes, continue",
      cancelButtonText: "Cancel",
      background: "#1e293b",
      color: "white",
    });

    if (!userConfirmation?.isConfirmed) return;

    // Confirmación final
    const finalConfirmation = await Alert({
      title: "Final Confirmation",
      text: "This is your last chance. Are you sure you want to submit the test?",
      icon: "question",
      type: "confirm",
      confirmButtonText: "Submit Test",
      cancelButtonText: "Cancel",
      background: "#1e293b",
      color: "white",
    });

    if (!finalConfirmation?.isConfirmed) return;

    setShowDetailsModal(false);
    setTestStarted(false);
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
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
        //setShowExamModal(false);
        fetchExamAndComments(selectedTestId);
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
              ? {
                ...comment,
                comment_title: data.comment_title,
                comment_value: data.comment_value,
              }
              : comment
          )
        );
        setShowEditCommentModal(false);
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

  const fetchExamAndComments = async (testId) => {
    try {
      // Fetch exam details with student answers
      const examResponse = await fetch(`${API_URL}/test-details-with-answers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ test_id: testId }),
      });

      if (!examResponse.ok) {
        const err = await examResponse.json();
        Alert({
          title: "Error",
          text: err.message || "Failed to load exam details",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
        return;
      }

      const examData = await examResponse.json();
      setExamDetails(examData.data);
      console.log(examData.data)

      // Fetch comments
      const commentResponse = await fetch(`${API_URL}/test-comments-per-id`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ test_id: testId }),
      });

      if (!commentResponse.ok) {
        const err = await commentResponse.json();
        Alert({
          title: "Error",
          text: err.message || "Failed to load comments",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
        return;
      }

      const commentData = await commentResponse.json();
      setComments(commentData.data);
      setSelectedTestId(testId);
      setShowExamModal(true);
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
    setShowExamModal(true);
    setIsAddingComment(true);
    fetchExamAndComments(testId);
  };

  const handleEditCommentClick = (comment) => {
    setSelectedComment(comment);
    setShowEditCommentModal(true);
  };

  const handleRetryTest = async (testId) => {
    const confirmRetry = await Alert({
      title: "Restart Test?",
      text: "This will count as a new attempt and any previous answers may be cleared.",
      icon: "warning",
      type: "confirm",
      confirmButtonText: "Yes, restart",
      cancelButtonText: "Cancel",
      background: "#1e293b",
      color: "white",
    });

    if (!confirmRetry?.isConfirmed) return;

    try {
      await fetchTestData(testId);
      await Alert({
        title: "Test Loaded",
        text: "You have started a new attempt. Good luck!",
        icon: "success",
        background: "#1e293b",
        color: "white",
      });
    } catch (error) {
      await Alert({
        title: "Error",
        text: "There was a problem restarting the test. Please try again.",
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
    {
      header: "Created At",
      key: "created_at",
      sortable: true,
      render: (row) => {
        const date = new Date(row.created_at);
        const formattedDate = new Intl.DateTimeFormat('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true, // <- esto activa el AM / PM
        }).format(date);
        return formattedDate;
      },
      sortValue: (row) => new Date(row.created_at).getTime(),
    },
    { header: "Email", key: "user_email" },
    { header: "Name", key: "user_name" },
    { header: "Lastname", key: "user_lastname" },
    { header: "Level", key: "level_name" },
    { header: "Status", key: "status" },
    {
      header: "Passed",
      key: "test_passed",
      render: (row) => {
        if (row.test_passed === 1) return "Aprobado";
        if (row.test_passed === 0) return "Reprobado";
        return "Pendiente";
      },
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center gap-3">
          {/* Ver resultado */}
          <button
            onClick={() => {
              if (row.status === "COMPLETED") {
                handleViewResult(row.pk_test);
              }
            }}
            className={`text-purple-600 hover:text-purple-800 ${row.status === "COMPLETED"
              ? "cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
              }`}
            title={
              row.status === "COMPLETED"
                ? "View test result"
                : "Result not available"
            }
          >
            <BarChart2 className="w-5 h-5" />
          </button>

          {/* Ver examen y comentarios */}
          <button
            onClick={() => fetchExamAndComments(row.pk_test)}
            className="text-blue-600 hover:text-blue-800 cursor-pointer"
            title="View Exam and Comments"
          >
            <Eye className="w-5 h-5" />
          </button>

          {/* Agregar comentario */}
          {/**
           * <button
            onClick={() => handleAddCommentClick(row.pk_test)}
            className="text-green-600 hover:text-green-800 cursor-pointer"
            title="Add Comment"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </button>
           */}

          {/* Reintentar test */}
          <button
            onClick={() => {
              if (row.status !== "COMPLETED") {
                handleRetryTest(row.pk_test);
              }
            }}
            className={`text-red-600 hover:text-red-800 ${row.status !== "COMPLETED"
              ? "cursor-pointer"
              : "text-gray-400 cursor-not-allowed"
              }`}
            title={
              row.status !== "COMPLETED"
                ? "Retry test"
                : "Cannot retry completed test"
            }
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
    {
      name: "comment_title",
      label: "Title",
      type: "text",
      validation: { required: "The title is required" },
    },
    {
      name: "comment_value",
      label: "Comment",
      type: "textarea",
      validation: { required: "Comment is required" },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex items-center justify-center p-8">
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
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-2xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105"
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
          className="rounded-xl shadow-xl overflow-hidden border border-gray-200"
          rowClassName="hover:bg-gray-100 transition duration-200"
        />

        {/* Pagination */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
        />

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
                    El examen TOEIC Online Listening and Reading dura 2 horas
                    (120 minutos): 50 preguntas de Listening y 50 de Reading.
                  </li>
                  <li>
                    Responde cuidadosamente las 100 preguntas de opción
                    múltiple.
                  </li>
                  <li>
                    Es indispensable tener una conexión estable a internet
                    durante todo el examen.
                  </li>
                  <li>
                    Usa un ambiente silencioso y sin distracciones para asegurar
                    tu concentración.
                  </li>
                  <li>
                    Una vez enviado el examen, no podrás modificar tus
                    respuestas.
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
                    The TOEIC Online Listening and Reading test lasts 2 hours
                    (120 minutes): 50 Listening questions and 50 Reading
                    questions.
                  </li>
                  <li>Carefully answer all 100 multiple-choice questions.</li>
                  <li>
                    A stable internet connection throughout the test is
                    essential.
                  </li>
                  <li>
                    Use a quiet environment free of distractions to ensure
                    focus.
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
                    If you close the test without completing it, one attempt
                    will be consumed and your answers will not be submitted or
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

        {/* Modal for Viewing Exam and Comments */}
        <Modal
          isOpen={showExamModal}
          onClose={() => {
            setShowExamModal(false);
            setIsAddingComment(false);
            setSelectedTestId(null);
            setExamDetails(null);
            fetchTests();
          }}
          title={`View Exam and Comments for Test #${selectedTestId}`}
        >
          <AnimatePresence>
            {showExamModal && (
              <motion.div
                key="modal-content"
                className="h-max overflow-y-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {isMobile ? (
                  showMobileComments ? (
                    <ViewExamComments
                      comments={comments}
                      isAddingComment={isAddingComment}
                      userRole={userRole}
                      commentFields={commentFields}
                      handleAddComment={handleAddComment}
                      handleEditCommentClick={handleEditCommentClick}
                      setIsAddingComment={setIsAddingComment}
                      Form={Form}
                      onCloseMobile={handleCloseMobileComments}
                    />
                  ) : (
                    <ViewExamDetails
                      examDetails={examDetails}
                      scrollRef={detailsScrollRef}
                      userRole={userRole}
                    />
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ViewExamDetails
                      examDetails={examDetails}
                      userRole={userRole}
                    />
                    <ViewExamComments
                      comments={comments}
                      isAddingComment={isAddingComment}
                      userRole={userRole}
                      commentFields={commentFields}
                      handleAddComment={handleAddComment}
                      handleEditCommentClick={handleEditCommentClick}
                      setIsAddingComment={setIsAddingComment}
                      Form={Form}
                    />
                  </div>
                )}

                {isMobile && !showMobileComments && (
                  <button
                    onClick={handleOpenMobileComments}
                    className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50"
                  >
                    <FiEdit3 className="h-7 w-7" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Modal>

        {/* Modal for Editing Comments */}
        <Modal
          isOpen={showEditCommentModal}
          onClose={() => {
            setShowEditCommentModal(false);
            setSelectedComment(null);
          }}
          title={`Edit Comment for Test`}
        >
          <div className="max-h-[80vh] overflow-y-auto">
            {selectedComment && (
              <div className="p-2">
                <Form
                  fields={commentFields}
                  initialData={{
                    comment_title: selectedComment.comment_title,
                    comment_value: selectedComment.comment_value,
                  }}
                  onSubmit={handleUpdateComment}
                  onCancel={() => {
                    setShowEditCommentModal(false);
                    setSelectedComment(null);
                  }}
                  submitText="Update Comment"
                  layout="grid-cols-1"
                />
              </div>
            )}
          </div>
        </Modal>


      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-opacity-80 z-50 flex items-center justify-center">
          <div className="bg-white border border-gray-200 shadow-xl rounded-2xl px-8 py-6 flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-800 text-base font-medium">
              Espere, evaluando el test...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;
