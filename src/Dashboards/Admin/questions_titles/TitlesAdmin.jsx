import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../Components/Alert.jsx';
import { API_URL } from '/config.js';
import { getAccessToken } from '../../../Utils/auth';
import Form from '../../../Components/Form.jsx';
import Table from '../../../Components/Table.jsx';
import Modal from '../../../Components/Modal.jsx';
import Pagination from '../../../Components/Pagination.jsx';
import { Plus, Edit, CheckCircle, Search, XCircle } from 'lucide-react';

const TitlesAdmin = () => {
  const [titles, setTitles] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1 });
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editTitle, setEditTitle] = useState(null);

  // 🟡 Corrección: filtros con valores por defecto para evitar undefineds
  const [filters, setFilters] = useState({
    title_name: '',
    title_type: '',
    status: ''
  });

  const filterFormRef = useRef();
  const navigate = useNavigate();
  const token = getAccessToken();

  const showAlert = (text, icon = 'success') => {
    Alert({
      title: icon === 'error' ? 'Error' : 'Éxito',
      text,
      icon,
      background: '#4b7af0',
      color: 'white',
    });
  };

  // ✅ Corrección: un solo useEffect que escucha cambios en filtros, página y perPage
  useEffect(() => {
    fetchTitles(filters, pagination.current_page, perPage);
  }, [filters, pagination.current_page, perPage]);

  const fetchTitles = async (customFilters = {}, page = 1, per_page = perPage) => {
    try {
      const response = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...customFilters, page, per_page }),
      });

      const data = await response.json();
      if (response.ok) {
        setTitles(data.titles || []);
        setPagination({
          current_page: data.pagination?.current_page || 1,
          total_pages: data.pagination?.total_pages || 1,
        });
      } else {
        showAlert(data.error || 'Error al obtener títulos', 'error');
      }
    } catch (err) {
      showAlert('Error de red', 'error');
    }
  };

  const handleSubmit = async (formData) => {
    const method = editTitle ? 'PUT' : 'POST';
    const endpoint = `${API_URL}/story`;
    const payload = editTitle ? { id: editTitle.pk_title, ...formData } : formData;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert(data.message || 'Operación exitosa');
        setShowModal(false);
        setEditTitle(null);
        fetchTitles(filters, pagination.current_page, perPage);
      } else {
        showAlert(data.error || 'Error al guardar el título', 'error');
      }
    } catch (err) {
      showAlert('Error de red', 'error');
    }
  };

  const toggleStatus = async (title) => {
    const newStatus = title.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    const result = await Alert({
      title: '¿Estás seguro?',
      text: `¿Deseas ${newStatus === 'INACTIVE' ? 'desactivar' : 'activar'} la pregunta: "${title.title_name}"?`,
      icon: 'warning',
      type: 'confirm',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`${API_URL}/story`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: title.pk_title,
          status: newStatus,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        showAlert(data.message || 'Estado actualizado');
        fetchTitles(filters, pagination.current_page, perPage);
      } else {
        showAlert('Error al cambiar estado', 'error');
      }
    } catch (err) {
      showAlert('Error de red', 'error');
    }
  };

  const clearFilters = () => {
    const cleared = { title_name: '', title_type: '', status: '' };
    setFilters(cleared);
    filterFormRef.current?.reset();
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleFilterSubmit = (data) => {
    setFilters(data);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const tableColumns = [
    { header: 'ID', key: 'pk_title' },
    { header: 'Nombre del título', key: 'title_name' },
    {
      header: 'Estado',
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  const actionRender = (title) => (
    <div className="flex gap-2">
      <button
        onClick={() => {
          setEditTitle(title);
          setShowModal(true);
        }}
        className="text-blue-600 hover:text-blue-800"
        title="Editar"
      >
        <Edit className="h-5 w-5" />
      </button>
      {title.status === 'ACTIVE' ? (
        <button onClick={() => toggleStatus(title)} className="text-red-500 hover:text-red-700" title="Desactivar">
          <XCircle className="h-5 w-5" />
        </button>
      ) : (
        <button onClick={() => toggleStatus(title)} className="text-green-500 hover:text-green-700" title="Activar">
          <CheckCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const formFields = [
    {
      name: 'title_name',
      label: 'Title',
      type: 'text',
      validation: {
        required: 'Title is required',
        maxLength: { value: 100, message: 'Maximum 100 characters' },
      },
    },
    {
      name: 'title_test',
      label: 'Description',
      type: 'textarea',
      validation: {
        required: 'Description is required',
        maxLength: { value: 2000, message: 'Maximum 2000 characters' },
      },
    },
    {
      name: 'title_type',
      label: 'Title Type',
      type: 'select',
      options: [
        { value: 'LISTENING', label: 'LISTENING' },
        { value: 'READING', label: 'READING' },
      ],
      validation: {
        required: 'Title type is required',
      },
    },
    {
      name: 'title_url',
      label: 'Title URL',
      type: 'text',
      validation: {
        maxLength: { value: 400, message: 'Maximum 400 characters' },
      },
    }
  ];

  const filterFields = [
    { name: 'title_name', label: 'Title Name', type: 'text' },
    {
      name: 'title_type',
      label: 'Title Type',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'LISTENING', label: 'LISTENING' },
        { value: 'READING', label: 'READING' },
      ],
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Title Management</h1>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <Search className="h-5 w-5" /> Filters
          </h2>
          <Form
            ref={filterFormRef}
            fields={filterFields}
            onSubmit={handleFilterSubmit}
            submitText="Apply Filters"
            onCancel={clearFilters}
            cancelText="Clear"
            layout="grid-cols-1 md:grid-cols-3"
          />
        </div>

        <div className="mb-6 text-center">
          <button
            onClick={() => { setEditTitle(null); setShowModal(true); }}
            className="py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" /> Create Title
          </button>
        </div>

        <Table columns={tableColumns} data={titles} onAction={actionRender} />

        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={(newPage) => setPagination(prev => ({ ...prev, current_page: newPage }))}
          perPage={perPage}
          onPerPageChange={(e) => {
            const newPerPage = parseInt(e.target.value, 10);
            setPerPage(newPerPage);
            setPagination(prev => ({ ...prev, current_page: 1 }));
          }}
        />

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditTitle(null); }} title={editTitle ? 'Edit Título' : 'Crear Título'}>
          <Form
            fields={formFields}
            onSubmit={handleSubmit}
            initialData={editTitle ? {
              title_name: editTitle.title_name,
              title_test: editTitle.title_test,
              title_type: editTitle.title_type,
              title_url: editTitle.title_url
            } : {
              title_name: '',
              title_test: '',
              title_type: 'READING',
              title_url: '',
            }}
            onCancel={() => { setShowModal(false); setEditTitle(null); }}
            submitText={editTitle ? 'Actualizar' : 'Crear'}
            layout="grid-cols-1"
          />
        </Modal>
      </div>
    </div>
  );
};

export default TitlesAdmin;
