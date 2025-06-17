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
import { Eye, MessageCircle, MessageSquarePlus, RotateCcw, BarChart2, Edit2 } from "lucide-react";
import Form from "../../../Components/Form.jsx";
import ViewExamComments from "../../../Components/Test/ViewExamComments.jsx";
import ViewExamDetails from "../../../Components/Test/ViewExamDetails.jsx";
import { AnimatePresence, motion } from "framer-motion";
import { FiEdit3 } from "react-icons/fi";
import ToeicInstructionsModal from "../../../Components/Test/ToeicInstructionsModal.jsx";
import ToeicFilters from "../../../Components/Test/ToeicFilters.jsx";
import StatusBadge from "../../../Components/StatusBadge.jsx";
import ActionButton from "../../../Components/ActionButton.jsx";
import TestResult from "../../../Components/TestResult.jsx";


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
    start_date: "",  // Nuevo campo
    end_date: ""     // Nuevo campo
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

  /**LIMPIAR FILTROS 
   * ----------------------------------------------------------- */

  const [filtersCleared, setFiltersCleared] = useState(0); // Usamos un contador

  const handleClearFilters = () => {
    setFilters({
      user_email: "",
      user_name: "",
      user_lastname: "",
      level_name: "",
      start_date: "",
      end_date: ""
    });
    setFiltersCleared(prev => prev + 1); // Incrementamos el contador
  };

  useEffect(() => {
    if (filtersCleared > 0) { // Solo ejecutar si el contador > 0
      fetchTests(1, perPage);
    }
  }, [filtersCleared]);
  /** ----------------------------------------------------------- */

  const fetchTests = async (page = 1, per_page = perPage, activeFilters = filters) => {
    setLoading(true);
    try {
      const body = {
        page,
        per_page,
        ...activeFilters
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


  /**DEFINICION DE COLUMNAS DE TABLA DE TESTS
   * ---------------------------------------------------
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    }).format(date);
  };
  // Columnas de la tabla (versión simplificada sin Tooltip)
  const tableColumns = [
    {
      header: "ID Test",
      key: "pk_test",
      width: 'w-24'
    },
    {
      header: "Fecha Creación",
      key: "created_at",
      sortable: true,
      render: (row) => formatDate(row.created_at),
      sortValue: (row) => new Date(row.created_at).getTime(),
      width: 'w-40'
    },
    {
      header: "Email",
      key: "user_email",
      render: (row) => (
        <a
          href={`mailto:${row.user_email}`}
          className="text-blue-600 hover:underline"
          title={`Enviar email a ${row.user_email}`}
        >
          {row.user_email}
        </a>
      )
    },
    {
      header: "Nombre",
      key: "user_name",
      render: (row) => `${row.user_name} ${row.user_lastname}`
    },
    {
      header: "Nivel",
      key: "level_name",
      render: (row) => (
        <span className="capitalize">
          {row.level_name?.toLowerCase() || 'N/A'}
        </span>
      )
    },
    {
      header: "Estado",
      key: "status",
      render: (row) => <StatusBadge status={row.status} />,
      sortValue: (row) => row.status
    },
    {
      header: "Resultado",
      key: "test_passed",
      render: (row) => <TestResult passed={row.test_passed} />,
      sortValue: (row) => row.test_passed
    },
    {
      header: "Acciones",
      key: "actions",
      width: 'w-32',
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <ActionButton
            icon={BarChart2}
            color="info"
            disabled={row.status !== "COMPLETED"}
            onClick={() => row.status === "COMPLETED" && handleViewResult(row.pk_test)}
            tooltip={row.status === "COMPLETED" ? "Ver resultados" : "Resultado no disponible"}
          />

          <ActionButton
            icon={Eye}
            color="primary"
            onClick={() => fetchExamAndComments(row.pk_test)}
            tooltip="Ver examen y comentarios"
          />

          <ActionButton
            icon={RotateCcw}
            color="danger"
            disabled={row.status === "COMPLETED"}
            onClick={() => row.status !== "COMPLETED" && handleRetryTest(row.pk_test)}
            tooltip={row.status !== "COMPLETED" ? "Reintentar test" : "No se puede reintentar"}
          />
        </div>
      ),
    },
  ];
  /**
   * ---------------------------------------------------
   */

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

        {/* Filters */} {/* Buttons */}
        <ToeicFilters
          filters={filters}
          loading={loading}
          onFilterChange={handleFilterChange}
          onApplyFilters={applyFilters}
          onCreateTest={() => setShowInstructions(true)}
          onClearFilters={handleClearFilters}
        />

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
        <ToeicInstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
          onCreateTest={createTest}
        />

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
          title={`View Exam and Comments`}
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
                      initialExamDetails={examDetails}
                      scrollRef={detailsScrollRef}
                      userRole={userRole}
                    />
                  )
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ViewExamDetails
                      initialExamDetails={examDetails}
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
