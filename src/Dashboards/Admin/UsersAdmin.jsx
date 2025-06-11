import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Alert from '../../components/Alert.jsx';
import { API_URL } from '/config.js';
import { getUserRole } from '../../Utils/auth.js';
import { User, Edit, XCircle, CheckCircle, Search, Plus } from 'lucide-react';
import Table from '../../Components/Table.jsx';
import Form from '../../Components/Form.jsx';
import Modal from '../../Components/Modal.jsx';
import Pagination from '../../Components/Pagination.jsx';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(10); // Estado para la cantidad de registros por página
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const navigate = useNavigate();
  const filterFormRef = useRef();

  // Solo un useForm para el formulario de creación/edición
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Verificar rol de admin
  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
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

  const fetchUsers = async (filters = {}, page = 1, per_page = perPage) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination({
          total_items: data.pagination?.total_items || 0,
          total_pages: data.pagination?.total_pages || 1,
          current_page: data.pagination?.current_page || 1,
        });
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Failed to fetch users',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        setUsers([]);
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
      setUsers([]);
      setPagination({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
      });
    }
  };

  const onFilterSubmit = (data) => {
    const filters = {
      user_email: data.email,
      user_name: data.name,
      user_lastname: data.lastname,
      user_role: data.role,
      status: data.status,
    };
    fetchUsers(filters);
  };

  const onUserSubmit = async (data) => {
    try {
      const endpoint = editUser ? '/users/edit' : '/users/create';
      const method = editUser ? 'PUT' : 'POST';
      const payload = editUser
        ? {
            name: data.name,
            lastname: data.lastname,
            role: data.role,
            current_email: editUser.user_email,
            new_email: data.email !== editUser.user_email ? data.email : undefined,
          }
        : {
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            role: data.role,
            password: data.password,
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
        fetchUsers();
        setShowModal(false);
        setEditUser(null);
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

  const deactivateUser = async (user) => {
    const result = await Alert({
      title: 'Are you sure?',
      text: `Do you want to deactivate ${user.user_name} ${user.user_lastname}?`,
      icon: 'question',
      type: 'confirm',
      confirmButtonText: 'Yes, deactivate',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/users/deactivate`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ email: user.user_email }),
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
          fetchUsers();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'The user could not be deactivated.',
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

  const activateUser = async (user) => {
    const result = await Alert({
      title: 'Are you sure?',
      text: `Do you want to activate ${user.user_name} ${user.user_lastname}?`,
      icon: 'question',
      type: 'confirm',
      confirmButtonText: 'Yes, activate',
      cancelButtonText: 'Cancel',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/users/activate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ email: user.user_email }),
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
          fetchUsers();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'The user could not be activated.',
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

  const openModal = (user = null) => {
    setEditUser(user);
    setShowModal(true);
  };

  const changePage = (page) => {
    fetchUsers({}, page);
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchUsers({}, 1, newPerPage); // Recarga desde la página 1 con el nuevo per_page
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'ID', key: 'pk_user' },
    { header: 'Name', key: 'user_name' },
    { header: 'Lastname', key: 'user_lastname' },
    { header: 'Email', key: 'user_email' },
    { header: 'Role', key: 'user_role' },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.status}
        </span>
      ),
    },
  ];

  // Configuración de campos para el formulario de creación/edición
  const formFields = [
    { name: 'name', label: 'Name', validation: { required: 'The name is required', pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, message: 'The name can only contain letters and spaces' } } },
    { name: 'lastname', label: 'Lastname', validation: { required: 'The lastname is required', pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, message: 'The lastname can only contain letters and spaces' } } },
    { name: 'email', label: 'Email', type: 'email', validation: { required: 'The email is required' } },
    { name: 'role', label: 'Role', type: 'select', options: [{ value: 'student', label: 'Student' }, { value: 'admin', label: 'Administrator' }, , { value: 'teacher', label: 'Teacher' }], validation: { required: 'The role is required' } },
];

  const filterFields = [
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'lastname', label: 'Lastname', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', options: [{ value: '', label: 'All' }, { value: 'admin', label: 'Admin' }, { value: 'student', label: 'Student' }, { value: 'teacher', label: 'Teacher' }] },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }] },
  ];

  const filterInitialData = {
    email: '',
    name: '',
    lastname: '',
    role: '',
    status: '',
  };

  const actionRender = (user) => (
    <div className="flex gap-2">
      <button onClick={() => openModal(user)} className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave" title="Edit">
        <Edit className="h-5 w-5" />
      </button>
      {user.status === 'ACTIVE' ? (
        <button onClick={() => deactivateUser(user)} className="text-red-500 hover:text-red-700" title="Deactivate">
          <XCircle className="h-5 w-5" />
        </button>
      ) : (
        <button onClick={() => activateUser(user)} className="text-green-500 hover:text-green-700" title="Activate">
          <CheckCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const clearFilters = () => {
    fetchUsers(); // Recarga la lista sin filtros
    filterFormRef.current?.reset(); // Limpia los campos del formulario
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">User Management</h1>

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

        {/* Botón para crear usuario */}
        <div className="mb-6 text-center">
          <button
            onClick={() => openModal()}
            className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" /> Create User
          </button>
        </div>

        {/* Tabla de usuarios */}
        <Table columns={tableColumns} data={users} onAction={actionRender} />

        {/* Paginación con selector de registros por página */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
          perPage={perPage}
          setPerPage={setPerPage}
          onPerPageChange={handlePerPageChange}
        />

        {/* Modal para crear/editar usuario */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditUser(null); }} title={editUser ? 'Edit User' : 'Create User'}>
          <Form
            fields={formFields.concat(!editUser ? [{ name: 'password', label: 'Password', type: 'password', validation: { required: 'The password is required', minLength: { value: 6, message: 'The password must be at least 6 characters' } } }] : [])}
            onSubmit={onUserSubmit}
            initialData={editUser ? {
              name: editUser.user_name,
              lastname: editUser.user_lastname,
              email: editUser.user_email,
              role: editUser.user_role,
            } : {
              name: '',
              lastname: '',
              email: '',
              role: 'student',
              password: '',
            }}
            onCancel={() => { setShowModal(false); setEditUser(null); }}
            submitText={editUser ? 'Update' : 'Create'}
            layout="grid-cols-1"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Users;