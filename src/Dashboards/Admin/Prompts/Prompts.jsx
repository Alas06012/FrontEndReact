import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../Components/Alert.jsx';
import { API_URL } from '/config.js';
import { getUserRole } from '../../../Utils/auth.js';
import { MessageSquare, Edit, CheckCircle, Search, Plus, Eye } from 'lucide-react';
import Table from '../../../Components/Table.jsx';
import Form from '../../../Components/Form.jsx';
import Modal from '../../../Components/Modal.jsx';
import Pagination from '../../../Components/Pagination.jsx';

// Componente principal para gestionar prompts
const Prompts = () => {
  const [prompts, setPrompts] = useState([]); // Lista de prompts
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(10); // Registros por página
  const [showModal, setShowModal] = useState(false); // Estado del modal
  const [editPrompt, setEditPrompt] = useState(null); // Prompt en edición
  const [viewFullPrompt, setViewFullPrompt] = useState(null); // Prompt para ver completo
  const navigate = useNavigate();
  const filterFormRef = useRef();

  // Hook Form para el formulario de creación/edición
  const { handleSubmit } = useForm();

  // Verificar rol de admin
  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole === 'admin') {
      fetchPrompts();
    } else {
      Alert({
        title: 'Access Denied',
        text: 'You need admin privileges to access this page.',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      navigate('/dashboard/' + userRole);
    }
  }, [userRole, navigate]);

  // Función para obtener los prompts desde el backend
  const fetchPrompts = async (filters = {}, page = 1, per_page = perPage) => {
    try {
      const response = await fetch(`${API_URL}/prompts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
        setPagination({
          total_items: data.pagination?.total_items || 0,
          total_pages: data.pagination?.total_pages || 1,
          current_page: data.pagination?.current_page || 1,
        });
        console.log('Pagination data:', {
          total_items: data.pagination?.total_items,
          total_pages: data.pagination?.total_pages,
          current_page: data.pagination?.current_page,
          per_page: per_page,
        });
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Failed to fetch prompts',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        setPrompts([]);
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
      setPrompts([]);
      setPagination({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
      });
    }
  };

  // Manejar el envío del formulario de filtros
  const onFilterSubmit = (data) => {
    const filters = {
      prompt_name: data.name,
      prompt_value: data.value,
      status: data.status,
    };
    fetchPrompts(filters);
  };

  // Manejar el envío del formulario de creación/edición
  const onPromptSubmit = async (data) => {
    try {
      const endpoint = editPrompt ? '/prompt' : '/prompt';
      const method = editPrompt ? 'PUT' : 'POST';
      const payload = {
        prompt_name: data.name,
        prompt_value: data.value,
      };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        Alert({
          title: 'Success',
          text: data.message,
          icon: 'success',
          background: '#4b7af0',
          color: 'white',
        });
        fetchPrompts();
        setShowModal(false);
        setEditPrompt(null);
        setViewFullPrompt(null); // Asegúrate de limpiar viewFullPrompt después de guardar
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Operation failed',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
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
    }
  };

  // Activar un prompt (desactiva los demás)
  const activatePrompt = async (prompt) => {
    const result = await Alert({
      title: '¿Estás seguro?',
      text: `¿Desea activar el prompt ${prompt.prompt_name}? Esto desactivará todos los demás prompts activos.`,
      icon: 'question',
      type: 'confirm',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/activate-prompts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ id_: prompt.pk_prompt }),
        });
        if (response.ok) {
          const data = await response.json();
          Alert({
            title: 'Éxito',
            text: data.message,
            icon: 'success',
            background: '#1e293b',
            color: 'white',
          });
          fetchPrompts();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'No se pudo activar el prompt',
            icon: 'error',
            background: '#1e293b',
            color: 'white',
          });
        }
      } catch (error) {
        Alert({
          title: 'Error',
          text: 'Ocurrió un error de red',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
      }
    }
  };

  // Abrir el modal para crear o editar
  const openModal = (prompt = null) => {
    setEditPrompt(prompt);
    setViewFullPrompt(null); // Limpiar viewFullPrompt al abrir el modal para crear/editar
    setShowModal(true);
  };

  // Abrir modal para ver el contenido completo
  const openViewModal = (prompt) => {
    setEditPrompt(null); // Limpiar editPrompt al abrir el modal para ver contenido completo
    setViewFullPrompt(prompt);
    setShowModal(true);
  };

  // Cambiar de página
  const changePage = (page) => {
    fetchPrompts({}, page);
  };

  // Manejar el cambio de registros por página
  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchPrompts({}, 1, newPerPage);
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'ID', key: 'pk_prompt' },
    { header: 'Nombre', key: 'prompt_name' },
    {
      header: 'Contenido',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span>{item.prompt_value.length > 50 ? item.prompt_value.slice(0, 50) + '...' : item.prompt_value}</span>
          {item.prompt_value.length > 50 && (
            <button
              onClick={() => openViewModal(item)}
              className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave"
              title="Ver completo"
            >
              <Eye className="h-5 w-5" />
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  // Configuración de campos para el formulario de creación/edición
  const formFields = [
    {
      name: 'name',
      label: 'Nombre del Prompt',
      validation: {
        required: 'El nombre es requerido',
        maxLength: { value: 50, message: 'El nombre no puede exceder 50 caracteres' },
      },
    },
    {
      name: 'value',
      label: 'Contenido del Prompt',
      type: 'textarea',
      validation: {
        required: 'El contenido es requerido',
      },
    },
  ];

  // Configuración de campos para el formulario de filtros
  const filterFields = [
    { name: 'name', label: 'Nombre', type: 'text' },
    { name: 'value', label: 'Contenido', type: 'text' },
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

  const filterInitialData = {
    name: '',
    value: '',
    status: '',
  };

  // Renderizar acciones (editar, activar)
  const actionRender = (prompt) => (
    <div className="flex gap-2">
      <button
        onClick={() => openModal(prompt)}
        className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave"
        title="Edit"
      >
        <Edit className="h-5 w-5" />
      </button>
      {prompt.status !== 'ACTIVE' && (
        <button
          onClick={() => activatePrompt(prompt)}
          className="text-green-500 hover:text-green-700"
          title="Activate"
        >
          <CheckCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  // Limpiar filtros
  const clearFilters = () => {
    fetchPrompts();
    filterFormRef.current?.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Administración de Prompts</h1>

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
            cancelText="Limpiar filtros"
          />
        </div>

        {/* Botón para crear prompt */}
        <div className="mb-6 text-center">
          <button
            onClick={() => openModal()}
            className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" /> Create Prompt
          </button>
        </div>

        {/* Tabla de prompts */}
        <Table columns={tableColumns} data={prompts} onAction={actionRender} />

        {/* Paginación */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
        />

        {/* Modal para crear/editar o ver contenido completo */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditPrompt(null);
            setViewFullPrompt(null);
          }}
          title={
            editPrompt
              ? 'Edit Prompt'
              : viewFullPrompt
              ? 'Contenido Completo'
              : 'Create Prompt'
          }
        >
          {editPrompt || !viewFullPrompt ? (
            <Form
              fields={formFields}
              onSubmit={onPromptSubmit}
              initialData={
                editPrompt
                  ? {
                      name: editPrompt.prompt_name,
                      value: editPrompt.prompt_value,
                    }
                  : {
                      name: '',
                      value: '',
                    }
              }
              onCancel={() => {
                setShowModal(false);
                setEditPrompt(null);
                setViewFullPrompt(null); // Limpiar viewFullPrompt al cancelar
              }}
              submitText={editPrompt ? 'Actualizar' : 'Crear'}
              layout="grid-cols-1"
            />
          ) : (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Nombre: {viewFullPrompt.prompt_name}</h3>
              <div className="bg-gray-100 p-4 rounded-md border border-gray-300">
                <p className="whitespace-pre-wrap break-words text-gray-800">{viewFullPrompt.prompt_value}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default Prompts;