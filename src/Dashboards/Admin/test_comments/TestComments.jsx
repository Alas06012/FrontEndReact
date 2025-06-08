import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../Components/Alert.jsx';
import { API_URL } from '../../../../config.js';
import { getUserRole } from '../../../Utils/auth.js';
import { Search, Plus, MessageCircle } from 'lucide-react';
import Table from '../../../Components/Table.jsx';
import Form from '../../../Components/Form.jsx';
import Modal from '../../../Components/Modal.jsx';
import Pagination from '../../../Components/Pagination.jsx';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(20); // Por defecto 20, como en el backend
  const [showModal, setShowModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const navigate = useNavigate();
  const filterFormRef = useRef();

  // Verificar rol de admin o teacher
  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole && ['admin', 'teacher'].includes(userRole)) {
      fetchTests();
    } else {
      Alert({
        title: 'Access Denied',
        text: 'You need admin or teacher privileges to access this page.',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      navigate('/dashboard/student');
    }
  }, [userRole, navigate]);

  const fetchTests = async (filters = {}, page = 1, per_page = perPage) => {
    try {
      const response = await fetch(`${API_URL}/all-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.tests.map(test => ({
          pk_test: test.pk_test,
          user_email: test.user_email || 'N/A',
          user_name: test.user_name || 'N/A',
          user_lastname: test.user_lastname || 'N/A',
          level_name: test.level_name || 'N/A',
          status: test.status,
          test_passed: test.test_passed || 'N/A',
        })));
        setPagination({
          total_items: data.pagination.total_items,
          total_pages: data.pagination.total_pages,
          current_page: data.pagination.current_page,
        });
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Failed to fetch tests',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        setTests([]);
        setPagination({
          total_items: 0,
          total_pages: 1,
          current_page: 1,
        });
      }
    } catch (error) {
      Alert({
        title: 'Error',
        text: 'Network error occurred',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      setTests([]);
      setPagination({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
      });
    }
  };

  const onFilterSubmit = (data) => {
    const filters = {
      user_email: data.user_email,
      user_name: data.user_name,
      user_lastname: data.user_lastname,
      test_passed: data.test_passed,
      level: data.level_name,
      status: data.status,
    };
    fetchTests(filters);
  };

  const addComment = async (data) => {
    try {
      const response = await fetch(`${API_URL}/test-comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
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
          title: 'Success',
          text: data.message,
          icon: 'success',
          background: '#1e293b',
          color: 'white',
        });
        setShowModal(false);
        fetchTests(); // Recargar tests para reflejar el comentario
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.message || 'Failed to add comment',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
      }
    } catch (error) {
      Alert({
        title: 'Error',
        text: 'Network error occurred',
        icon: 'error',
        background: '#1e293b',
        color: 'white',
      });
    }
  };

  const openModal = (testId) => {
    setSelectedTestId(testId);
    setShowModal(true);
  };

  const changePage = (page) => {
    fetchTests({}, page);
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchTests({}, 1, newPerPage); // Recarga desde la página 1
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'ID Test', key: 'pk_test' },
    { header: 'Email', key: 'user_email' },
    { header: 'Name', key: 'user_name' },
    { header: 'Lastname', key: 'user_lastname' },
    { header: 'Level', key: 'level_name' },
    { header: 'Status', key: 'status' },
    { header: 'Passed', key: 'test_passed' },
  ];

  // Configuración de campos para el formulario de filtros
  const filterFields = [
    { name: 'user_email', label: 'Email', type: 'text' },
    { name: 'user_name', label: 'Name', type: 'text' },
    { name: 'user_lastname', label: 'Lastname', type: 'text' },
    {
      name: 'test_passed',
      label: 'Passed',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: '1', label: 'Yes' },
        { value: '0', label: 'No' },
      ],
    },
    {
      name: 'level_name',
      label: 'Level',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'A1', label: 'A1' },
        { value: 'A2', label: 'A2' },
        { value: 'B1', label: 'B1' },
        { value: 'B2', label: 'B2' },
        { value: 'C1', label: 'C1' },
        { value: 'C2', label: 'C2' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'IN_PROGRESS', label: 'In Progress' },
        { value: 'CHECKING_ANSWERS', label: 'Checking Answers' },
      ],
    },
  ];

  const filterInitialData = {
    user_email: '',
    user_name: '',
    user_lastname: '',
    test_passed: '',
    level_name: '',
    status: '',
  };

  // Configuración de campos para el formulario de comentarios
  const commentFields = [
    { name: 'comment_title', label: 'Title (Optional)', type: 'text' },
    { name: 'comment_value', label: 'Comment', type: 'textarea', validation: { required: 'Comment is required' } },
  ];

  const actionRender = (test) => (
    <div className="flex gap-2">
      <button onClick={() => openModal(test.pk_test)} className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave" title="Add Comment">
        <MessageCircle className="h-5 w-5" />
      </button>
    </div>
  );

  const clearFilters = () => {
    fetchTests();
    filterFormRef.current?.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Test Management</h1>

        {/* Filtros */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <Search className="h-5 w-5" /> Filters
          </h2>
          <Form
            ref={filterFormRef}
            fields={filterFields}
            onSubmit={onFilterSubmit}
            initialData={filterInitialData}
            submitText="Apply Filters"
            layout="grid-cols-1 md:grid-cols-3"
            onCancel={clearFilters}
            cancelText="Clear Filters"
          />
        </div>

        {/* Tabla de Tests */}
        <Table columns={tableColumns} data={tests} onAction={actionRender} />

        {/* Paginación con selector de registros por página */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
        />

        {/* Modal para agregar comentario */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={`Add Comment to Test #${selectedTestId}`}
        >
          <Form
            fields={commentFields}
            onSubmit={addComment}
            onCancel={() => setShowModal(false)}
            submitText="Save Comment"
            layout="grid-cols-1"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Tests;