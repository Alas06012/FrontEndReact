import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../Components/Alert.jsx';
import { API_URL } from '/config.js';
import { getUserRole } from '../../../Utils/auth.js';
import { Book, Edit, Trash2, Search, Plus, Eye } from 'lucide-react';
import Table from '../../../Components/Table.jsx';
import Form from '../../../Components/Form.jsx';
import Modal from '../../../Components/Modal.jsx';
import Pagination from '../../../Components/Pagination.jsx';

// Componente principal para gestionar materiales de estudio
const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [viewMaterial, setViewMaterial] = useState(null);
  const [fileEnabled, setFileEnabled] = useState(false); // Controla si el campo file está habilitado
  const [selectedType, setSelectedType] = useState(''); // Almacena el tipo de archivo seleccionado
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const navigate = useNavigate();
  const filterFormRef = useRef();

  const { handleSubmit, watch, setValue } = useForm();

  // Mapeo de niveles CEFR a valores numéricos
  const levelMapping = {
    1: 'A1',
    2: 'A2',
    3: 'B1',
    4: 'B2',
    5: 'C1',
    6: 'C2',
  };

  const levelOptions = [
    { value: '', label: 'Select Level' },
    { value: '1', label: 'A1' },
    { value: '2', label: 'A2' },
    { value: '3', label: 'B1' },
    { value: '4', label: 'B2' },
    { value: '5', label: 'C1' },
    { value: '6', label: 'C2' },
  ];

  const filterLevelOptions = [
    { value: '', label: 'All' },
    { value: '1', label: 'A1' },
    { value: '2', label: 'A2' },
    { value: '3', label: 'B1' },
    { value: '4', label: 'B2' },
    { value: '5', label: 'C1' },
    { value: '6', label: 'C2' },
  ];

  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole === 'admin' || userRole === 'teacher') {
      fetchMaterials();
    } else {
      Alert({
        title: 'Access Denied',
        text: 'You need more privileges to access this page.',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      navigate('/dashboard/'+ userRole);
    }
  }, [userRole, navigate]);

  const fetchMaterials = async (filters = {}, page = 1, per_page = perPage) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        Alert({
          title: 'Session Expired',
          text: 'Please log in to continue.',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/materials/filter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.status === 401) {
        Alert({
          title: 'Session Expired',
          text: 'Your session has expired. Please log in again.',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        localStorage.removeItem('access_token');
        navigate('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setMaterials(data.materials || []);
        setPagination({
          total_items: data.pagination.total_items,
          total_pages: data.pagination.total_pages,
          current_page: data.pagination.current_page,
        });
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Failed to fetch materials',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        setMaterials([]);
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
      setMaterials([]);
      setPagination({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
      });
    }
  };

  const onFilterSubmit = (data) => {
    const filters = {
      studymaterial_title: data.title,
      studymaterial_desc: data.description,
      studymaterial_type: data.type,
      level_fk: data.level,
      studymaterial_tags: data.tags,
    };
    fetchMaterials(filters);
  };

  const onMaterialSubmit = async (data) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        Alert({
          title: 'Session Expired',
          text: 'Please log in to continue.',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        navigate('/login');
        return;
      }

      setLoading(true); // Activar el estado de carga

      if (editMaterial) {
        // Modo edición: enviar datos como JSON
        const endpoint = '/materials/update';
        const payload = {
          pk_studymaterial: editMaterial.pk_studymaterial,
          studymaterial_title: data.title,
          studymaterial_desc: data.description,
          studymaterial_type: data.type,
          studymaterial_url: editMaterial.studymaterial_url, // Mantener URL existente
          level_fk: data.level,
          studymaterial_tags: data.tags,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 401) {
          Alert({
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'error',
            background: '#4b7af0',
            color: 'white',
          });
          localStorage.removeItem('access_token');
          navigate('/login');
          setLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          Alert({
            title: 'Success',
            text: data.message,
            icon: 'success',
            background: '#4b7af0',
            color: 'white',
          });
          fetchMaterials();
          setShowModal(false);
          setEditMaterial(null);
          setViewMaterial(null);
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
      } else {
        // Modo creación: enviar datos como FormData con archivo
        const endpoint = '/materials/create';
        const formData = new FormData();

        // Validar y agregar los campos al FormData
        formData.append('studymaterial_title', data.title || '');
        formData.append('studymaterial_desc', data.description || '');
        formData.append('studymaterial_type', data.type || '');
        formData.append('level_fk', data.level || '');
        formData.append('studymaterial_tags', data.tags || '');

        // Manejo del archivo
        const file = data.file?.[0]; // FileList, tomamos el primer archivo
        if (!file) {
          Alert({
            title: 'Error',
            text: 'Please select a file to upload',
            icon: 'error',
            background: '#4b7af0',
            color: 'white',
          });
          setLoading(false);
          return;
        }

        // Validar extensión del archivo en el frontend
        const allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'mp4', 'mov'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
          Alert({
            title: 'Error',
            text: 'File type not allowed. Allowed types: pdf, doc, docx, ppt, pptx, mp4, mov',
            icon: 'error',
            background: '#4b7af0',
            color: 'white',
          });
          setLoading(false);
          return;
        }

        formData.append('file', file);

        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.status === 401) {
          Alert({
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'error',
            background: '#4b7af0',
            color: 'white',
          });
          localStorage.removeItem('access_token');
          navigate('/login');
          setLoading(false);
          return;
        }

        if (response.ok) {
          const data = await response.json();
          Alert({
            title: 'Success',
            text: data.message,
            icon: 'success',
            background: '#4b7af0',
            color: 'white',
          });
          fetchMaterials();
          setShowModal(false);
          setEditMaterial(null);
          setViewMaterial(null);
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
      }
    } catch (error) {
      Alert({
        title: 'Error',
        text: `Network error occurred: ${error.message}`,
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
    } finally {
      setLoading(false); // Desactivar el estado de carga
    }
  };

  const deleteMaterial = async (materialId) => {
    const result = await Alert({
      title: 'Are you sure?',
      text: 'Do you want to delete this material? This action cannot be undone.',
      icon: 'question',
      type: 'confirm',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          Alert({
            title: 'Session Expired',
            text: 'Please log in to continue.',
            icon: 'error',
            background: '#4b7af0',
            color: 'white',
          });
          navigate('/login');
          return;
        }

        const response = await fetch(`${API_URL}/materials/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pk_studymaterial: materialId }),
        });

        if (response.status === 401) {
          Alert({
            title: 'Session Expired',
            text: 'Your session has expired. Please log in again.',
            icon: 'error',
            background: '#4b7af0',
            color: 'white',
          });
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }

        if (response.ok) {
          const data = await response.json();
          Alert({
            title: 'Success',
            text: data.message,
            icon: 'success',
            background: '#1e293b',
            color: 'white',
          });
          fetchMaterials();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'The material could not be deleted.',
            icon: 'error',
            background: '#1e293b',
            color: 'white',
          });
        }
      } catch (error) {
        Alert({
          title: 'Error',
          text: 'A network error occurred',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
      }
    }
  };

  const openModal = (material = null) => {
    setEditMaterial(material);
    setViewMaterial(null);
    setShowModal(true);
    if (material) {
      setSelectedType(material.studymaterial_type); // Establecer el tipo al editar
    } else {
      setSelectedType(''); // Reiniciar el tipo al crear
      setFileEnabled(false); // Deshabilitar file al crear
      setValue('type', ''); // Reiniciar el valor del campo type
      setValue('file', null); // Reiniciar el valor del campo file
    }
  };

  const openViewModal = (material) => {
    setEditMaterial(null);
    setViewMaterial(material);
    setShowModal(true);
  };

  const changePage = (page) => {
    fetchMaterials({}, page);
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchMaterials({}, 1, newPerPage);
  };

  const tableColumns = [
    { header: 'ID', key: 'pk_studymaterial' },
    { header: 'Title', key: 'studymaterial_title' },
    {
      header: 'Description',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span>{item.studymaterial_desc?.length > 50 ? item.studymaterial_desc.slice(0, 50) + '...' : item.studymaterial_desc || 'N/A'}</span>
          {item.studymaterial_desc?.length > 50 && (
            <button
              onClick={() => openViewModal(item)}
              className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave"
              title="View full description"
            >
              <Eye className="h-5 w-5" />
            </button>
          )}
        </div>
      ),
    },
    { header: 'Type', key: 'studymaterial_type' },
    { header: 'Level', render: (item) => levelMapping[item.level_fk] || 'N/A' },
    {
      header: 'Actions',
      render: (item) => (
        <div className="flex gap-2">
          <button
            onClick={() => openModal(item)}
            className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave"
            title="Edit"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => deleteMaterial(item.pk_studymaterial)}
            className="text-red-500 hover:text-red-700"
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </button>
          {item.studymaterial_url && (
            <a
              href={item.studymaterial_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700"
              title="View File"
            >
              <Book className="h-5 w-5" />
            </a>
          )}
        </div>
      ),
    },
  ];

  // Observar el valor del campo 'type' para habilitar/deshabilitar el campo 'file'
  const typeValue = watch('type');
  useEffect(() => {
    if (!editMaterial) {
      // Solo en modo creación
      setFileEnabled(!!typeValue && typeValue !== '');
      setSelectedType(typeValue || '');
    }
  }, [typeValue, editMaterial]);

  const getFileAccept = () => {
    if (editMaterial || !selectedType) return '.pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov';
    switch (selectedType) {
      case 'PDF':
        return '.pdf';
      case 'Video':
        return '.mp4,.mov';
      case 'Document':
        return '.doc,.docx';
      case 'Presentation':
        return '.ppt,.pptx';
      default:
        return '.pdf,.doc,.docx,.ppt,.pptx,.mp4,.mov';
    }
  };

  const formFields = [
    {
      name: 'title',
      label: 'Title',
      validation: { required: 'Title is required', maxLength: { value: 250, message: 'Title cannot exceed 250 characters' } },
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      validation: { required: 'Description is required' },
    },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'Select Type' },
        { value: 'PDF', label: 'PDF' },
        { value: 'Video', label: 'Video' },
        { value: 'Document', label: 'Document' },
        { value: 'Presentation', label: 'Presentation' },
      ],
      validation: { required: 'Type is required' },
    },
    {
      name: 'file',
      label: editMaterial ? 'File Name' : 'File',
      type: editMaterial ? 'text' : 'file', // Cambiar a text en modo edición
      value: editMaterial ? editMaterial.studymaterial_url.split('/').pop() : '',
      accept: getFileAccept(),
      validation: { 
        required: editMaterial ? false : 'File is required',
        validate: (files) => {
          if (editMaterial || !files || files.length === 0) return true;
          const file = files[0];
          const allowedExtensions = getFileAccept().split(',').map(ext => ext.replace('.', ''));
          const fileExtension = file.name.split('.').pop().toLowerCase();
          return allowedExtensions.includes(fileExtension) || 'File type not allowed';
        },
      },
      disabled: editMaterial || !fileEnabled, // Deshabilitar en modo edición o si no se seleccionó tipo
    },
    {
      name: 'level',
      label: 'Level',
      type: 'select',
      options: levelOptions,
      validation: { required: 'Level is required' },
    },
    {
      name: 'tags',
      label: 'Tags (comma-separated)',
      type: 'text',
    },
  ];

  const filterFields = [
    { name: 'title', label: 'Title', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'PDF', label: 'PDF' },
        { value: 'Video', label: 'Video' },
        { value: 'Document', label: 'Document' },
        { value: 'Presentation', label: 'Presentation' },
      ],
    },
    {
      name: 'level',
      label: 'Level',
      type: 'select',
      options: filterLevelOptions,
    },
    { name: 'tags', label: 'Tags', type: 'text' },
  ];

  const filterInitialData = {
    title: '',
    description: '',
    type: '',
    level: '',
    tags: '',
  };

  const clearFilters = () => {
    fetchMaterials();
    filterFormRef.current?.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Study Materials Management</h1>

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

        <div className="mb-6 text-center">
          <button
            onClick={() => openModal()}
            className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" /> Create Material
          </button>
        </div>

        <Table columns={tableColumns} data={materials} />

        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
        />

        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditMaterial(null);
            setViewMaterial(null);
            setLoading(false);
          }}
          title={
            editMaterial
              ? 'Edit Material'
              : viewMaterial
              ? 'View Material Details'
              : 'Create Material'
          }
        >
          {editMaterial || !viewMaterial ? (
            <div className="relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-opacity-50 bg-gray-200">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-10 w-10 text-Paleta-Celeste"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                      ></path>
                    </svg>
                    <span className="mt-2 text-gray-700">Uploading...</span>
                  </div>
                </div>
              )}
              <Form
                fields={formFields}
                onSubmit={onMaterialSubmit}
                initialData={
                  editMaterial
                    ? {
                        title: editMaterial.studymaterial_title,
                        description: editMaterial.studymaterial_desc,
                        type: editMaterial.studymaterial_type,
                        level: editMaterial.level_fk,
                        tags: editMaterial.studymaterial_tags,
                      }
                    : {
                        title: '',
                        description: '',
                        type: '',
                        file: null,
                        level: '',
                        tags: '',
                      }
                }
                onCancel={() => {
                  setShowModal(false);
                  setEditMaterial(null);
                  setViewMaterial(null);
                  setLoading(false);
                }}
                submitText={editMaterial ? 'Update' : 'Create'}
                layout="grid-cols-1"
                encType={editMaterial ? 'application/json' : 'multipart/form-data'}
                disabled={loading} // Deshabilitar el formulario mientras se carga
              />
            </div>
          ) : (
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2">Title: {viewMaterial.studymaterial_title}</h3>
              <p className="mb-2">Description: {viewMaterial.studymaterial_desc || 'N/A'}</p>
              <p className="mb-2">Type: {viewMaterial.studymaterial_type || 'N/A'}</p>
              <p className="mb-2">Level: {levelMapping[viewMaterial.level_fk] || 'N/A'}</p>
              <p className="mb-2">Tags: {viewMaterial.studymaterial_tags || 'N/A'}</p>
              {viewMaterial.studymaterial_url && (
                <p className="mb-2">
                  File: <span className="text-blue-500">{viewMaterial.studymaterial_url.split('/').pop()}</span>
                </p>
              )}
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default StudyMaterials;